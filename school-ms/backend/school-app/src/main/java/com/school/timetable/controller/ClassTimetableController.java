package com.school.timetable.controller;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.school.timetable.model.TimetableSettings;
import com.school.timetable.model.TimetableSlot;
import com.school.timetable.repository.TimetableSettingsRepository;
import com.school.timetable.repository.TimetableSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/timetable")
public class ClassTimetableController {

    private final TimetableSlotRepository slotRepo;
    private final TimetableSettingsRepository settingsRepo;
    private final JdbcTemplate jdbc;

    @Autowired
    public ClassTimetableController(TimetableSlotRepository slotRepo,
            TimetableSettingsRepository settingsRepo,
            JdbcTemplate jdbc) {
        this.slotRepo = slotRepo;
        this.settingsRepo = settingsRepo;
        this.jdbc = jdbc;
    }

    public record GenerateRequest(Long classId,
            @JsonAlias( {
                    "section", "sectionId" }) String sectionId,
            boolean lockExisting){
    }

    // Grid cell returned to the UI (IDs retained for compatibility; display fields
    // added)
    public record GridCell(Long subjectId, Long teacherDetailsId, boolean locked,
            String subjectCode, String subjectName, String teacherName) {
    }

    // Response expected by the frontend: periodsPerDay + days + grid(dayIdx ->
    // periodNo -> cell)
    public record SlotsResponse(int periodsPerDay, List<String> days, Map<Integer, Map<Integer, GridCell>> grid) {
    }

    public record UpdateSlotRequest(Long classId, @JsonAlias( {
            "section", "sectionId" }) String sectionId, Integer dayOfWeek, Integer periodNo,
            Long subjectId, Long teacherDetailsId, Boolean locked){
    }

    public record EligibleTeachersResponse(List<Map<String, Object>> teachers) {
    }

    public record EligibleSubjectsResponse(List<Map<String, Object>> subjects) {
    }

    @GetMapping("/slots")
    public ResponseEntity<SlotsResponse> getSlots(@RequestParam Long classId,
            @RequestParam String section) {
        TimetableSettings settings = settingsRepo.findTopByOrderByIdAsc()
                .orElseGet(() -> {
                    TimetableSettings s = new TimetableSettings();
                    s.setPeriodsPerDay(8);
                    s.setLunchAfterPeriod(4);
                    s.setWorkingDaysMask(31); // 11111b Mon..Fri
                    return s;
                });

        // Resolve section id from grade+section name using exam tables (if section is a
        // letter)
        Long sectionId = resolveSectionIdIfNeeded(classId, section);

        List<TimetableSlot> slots = slotRepo.findByClassIdAndSectionIdOrderByDayOfWeekAscPeriodNoAsc(classId,
                sectionId);
        int periodsPerDay = settings.getPeriodsPerDay() != null ? settings.getPeriodsPerDay() : 8;
        return ResponseEntity.ok(buildGridResponse(periodsPerDay, slots));
    }

    @PostMapping("/generate")
    public ResponseEntity<SlotsResponse> generate(@RequestBody GenerateRequest req) {
        if (req.classId() == null || req.sectionId() == null || req.sectionId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        TimetableSettings settings = settingsRepo.findTopByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Timetable settings not configured"));

        int periodsPerDay = Optional.ofNullable(settings.getPeriodsPerDay()).orElse(8);
        int lunchAfter = Optional.ofNullable(settings.getLunchAfterPeriod()).orElse(4);
        int maxPerTeacherPerDay = Optional.ofNullable(settings.getMaxPeriodsPerTeacherPerDay()).orElse(periodsPerDay);
        int mask = Optional.ofNullable(settings.getWorkingDaysMask()).orElse(31); // Mon..Fri bits

        // Resolve section id and section letter once
        Long resolvedSectionId = resolveSectionIdIfNeeded(req.classId(), req.sectionId());
        String sectionLetter = resolveSectionNameIfNeeded(req.sectionId());

        // Optionally retain existing locked slots; if not requested, clear existing
        // timetable
        if (!req.lockExisting()) {
            slotRepo.deleteByClassIdAndSectionId(req.classId(), resolvedSectionId);
        }

        // Build a map day->period->slot, pre-populate lunch/locked slots
        Map<Integer, Map<Integer, TimetableSlot>> grid = new HashMap<>();
        for (int d = 1; d <= 5; d++) { // Mon..Fri
            if (!isWorkingDay(mask, d))
                continue;
            Map<Integer, TimetableSlot> row = new HashMap<>();
            for (int p = 1; p <= periodsPerDay; p++) {
                TimetableSlot s = new TimetableSlot();
                s.setClassId(req.classId());
                s.setSectionId(resolvedSectionId);
                s.setDayOfWeek(d);
                s.setPeriodNo(p);
                boolean isLunch = p == lunchAfter;
                s.setLocked(isLunch); // lunch is locked
                s.setGeneratedBy("AUTO");
                row.put(p, s);
            }
            grid.put(d, row);
        }

        // Load existing locked slots if keeping existing
        if (req.lockExisting()) {
            List<TimetableSlot> existing = slotRepo
                    .findByClassIdAndSectionIdOrderByDayOfWeekAscPeriodNoAsc(req.classId(), resolvedSectionId);
            for (TimetableSlot s : existing) {
                grid.computeIfAbsent(s.getDayOfWeek(), k -> new HashMap<>()).put(s.getPeriodNo(), s);
            }
        }

        // Fetch requirements: which subjects are needed for this class/section and how
        // many weekly periods
        List<Map<String, Object>> reqs = jdbc.queryForList(
                "select subject_id, weekly_periods from timetable_requirements where class_id = ? and section_id = ?",
                req.classId(), resolvedSectionId);

        // Build subject -> eligible teacher ids using intersection of teacher_class_map
        // and teacher_subject_map
        Map<Long, List<Long>> subjectTeachers = new HashMap<>();
        // Ensure we use section letter for the teacher_class_map join (it stores
        // letters like 'A')
        for (Map<String, Object> row : reqs) {
            Long subjectId = ((Number) row.get("subject_id")).longValue();
            List<Long> teacherIds = jdbc.query(
                    "select ts.teacher_details_id " +
                            "from teacher_subject_map ts " +
                            "join teacher_class_map tc on tc.teacher_details_id = ts.teacher_details_id and tc.class_id = ? and tc.section = ? "
                            +
                            "where ts.subject_id = ?",
                    (rs, rn) -> rs.getLong(1), req.classId(), sectionLetter, subjectId);
            subjectTeachers.put(subjectId, teacherIds);
        }

        // day -> teacherId -> count assigned today
        Map<Integer, Map<Long, Integer>> dayTeacherLoad = new HashMap<>();

        // Greedy fill with fair day distribution: iterate and spread occurrences across
        // working days
        // Make a queue of (subjectId, remainingPeriods)
        Deque<long[]> queue = new ArrayDeque<>();
        for (Map<String, Object> row : reqs) {
            Long subjectId = ((Number) row.get("subject_id")).longValue();
            Integer weekly = ((Number) row.get("weekly_periods")).intValue();
            if (weekly != null && weekly > 0) {
                queue.add(new long[] { subjectId, weekly });
            }
        }

        // Save point to hold newly created slots before persisting
        List<TimetableSlot> toSave = new ArrayList<>();

        // Prepare ordered list of working days (ISO 1..7, we only consider Mon..Fri
        // here)
        List<Integer> workingDays = new ArrayList<>();
        for (int d = 1; d <= 5; d++) {
            if (isWorkingDay(mask, d))
                workingDays.add(d);
        }
        if (workingDays.isEmpty()) {
            return ResponseEntity.ok(buildGridResponse(periodsPerDay, Collections.emptyList()));
        }
        int startDayIdx = 0; // rotate start to distribute across week

        while (!queue.isEmpty()) {
            long[] item = queue.pollFirst();
            long subjectId = item[0];
            long remaining = item[1];

            boolean placedThisRound = false;

            // Try to place one occurrence of this subject across working days, starting at
            // rotating index
            for (int di = 0; di < workingDays.size() && !placedThisRound; di++) {
                int d = workingDays.get((startDayIdx + di) % workingDays.size());
                Map<Integer, TimetableSlot> row = grid.get(d);
                if (row == null)
                    continue;

                // Avoid repeating the same subject on the same day if possible
                boolean subjectAlreadyToday = row.values().stream()
                        .anyMatch(s -> s.getSubjectId() != null && Objects.equals(s.getSubjectId(), subjectId));
                if (subjectAlreadyToday)
                    continue;

                for (int p = 1; p <= periodsPerDay && !placedThisRound; p++) {
                    TimetableSlot slot = row.get(p);
                    if (Boolean.TRUE.equals(slot.getLocked()))
                        continue;
                    if (slot.getSubjectId() != null)
                        continue; // already filled

                    // pick a teacher with capacity and eligibility
                    Long teacherId = pickTeacherFor(subjectId, d, dayTeacherLoad, subjectTeachers, maxPerTeacherPerDay);
                    // Always place the subject; if no eligible teacher, leave teacherDetailsId null
                    slot.setSubjectId(subjectId);
                    if (teacherId != null) {
                        slot.setTeacherDetailsId(teacherId);
                        markLoad(d, teacherId, dayTeacherLoad);
                    }
                    toSave.add(slot);
                    placedThisRound = true;
                }
            }

            if (!placedThisRound) {
                // couldn't place now; break to avoid infinite loop
                break;
            } else {
                remaining -= 1;
                if (remaining > 0) {
                    queue.addLast(new long[] { subjectId, remaining });
                }
                // rotate start day for next placement to spread load across the week
                startDayIdx = (startDayIdx + 1) % workingDays.size();
            }
        }

        // Persist newly filled slots
        if (!toSave.isEmpty()) {
            slotRepo.saveAll(toSave);
        }

        // Return the latest grid
        List<TimetableSlot> slots = slotRepo.findByClassIdAndSectionIdOrderByDayOfWeekAscPeriodNoAsc(req.classId(),
                resolvedSectionId);
        return ResponseEntity.ok(buildGridResponse(periodsPerDay, slots));
    }

    // List eligible teachers for a given class/section/subject
    @GetMapping("/eligible-teachers")
    public ResponseEntity<EligibleTeachersResponse> eligibleTeachers(@RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long subjectId) {
        String sectionLetter = resolveSectionNameIfNeeded(section);
        // Intersect teacher_subject_map and teacher_class_map, with name from
        // school_staff if present
        List<Map<String, Object>> rows = jdbc.queryForList(
                "select td.id as id, coalesce(ss.first_name || ' ' || ss.last_name, cast(td.id as varchar)) as name " +
                        "from teacher_subject_map ts " +
                        "join teacher_details td on td.id = ts.teacher_details_id " +
                        "join teacher_class_map tc on tc.teacher_details_id = td.id and tc.class_id = ? and tc.section = ? "
                        +
                        "left join school_staff ss on ss.teacher_details_id = td.id " +
                        "where ts.subject_id = ?",
                classId, sectionLetter, subjectId);
        return ResponseEntity.ok(new EligibleTeachersResponse(rows));
    }

    // List available subjects for a class/section (from requirements)
    @GetMapping("/available-subjects")
    public ResponseEntity<EligibleSubjectsResponse> availableSubjects(@RequestParam Long classId,
            @RequestParam String section) {
        Long sectionId = resolveSectionIdIfNeeded(classId, section);
        String sectionLetter = resolveSectionNameIfNeeded(section);
        List<Map<String, Object>> rows = jdbc.queryForList(
                "select s.id as id, s.code as code, s.name as name " +
                        "from timetable_requirements tr join subjects s on s.id = tr.subject_id " +
                        "where tr.class_id = ? and tr.section_id = ?",
                classId, sectionId);
        if (rows == null || rows.isEmpty()) {
            // Fallback: union of subjects taught by any teacher assigned to this
            // class/section
            rows = jdbc.queryForList(
                    "select distinct s.id as id, s.code as code, s.name as name " +
                            "from teacher_class_map tc " +
                            "join teacher_subject_map ts on ts.teacher_details_id = tc.teacher_details_id " +
                            "join subjects s on s.id = ts.subject_id " +
                            "where tc.class_id = ? and tc.section = ? " +
                            "order by s.name",
                    classId, sectionLetter);
        }
        return ResponseEntity.ok(new EligibleSubjectsResponse(rows));
    }

    // Update a specific slot (subject and/or teacher). Performs basic conflict
    // checks.
    @PostMapping("/update-slot")
    public ResponseEntity<SlotsResponse> updateSlot(@RequestBody UpdateSlotRequest req) {
        if (req.classId() == null || req.sectionId() == null || req.dayOfWeek() == null || req.periodNo() == null) {
            return ResponseEntity.badRequest().build();
        }
        Long sectionId = resolveSectionIdIfNeeded(req.classId(), req.sectionId());
        var slotOpt = slotRepo.findByClassIdAndSectionIdAndDayOfWeekAndPeriodNo(req.classId(), sectionId,
                req.dayOfWeek(), req.periodNo());
        TimetableSlot slot = slotOpt.orElseGet(() -> {
            TimetableSlot s = new TimetableSlot();
            s.setClassId(req.classId());
            s.setSectionId(sectionId);
            s.setDayOfWeek(req.dayOfWeek());
            s.setPeriodNo(req.periodNo());
            s.setGeneratedBy("MANUAL");
            return s;
        });

        if (Boolean.TRUE.equals(slot.getLocked())) {
            // don't allow editing lunch/locked
            return ResponseEntity.status(409).build();
        }

        // If teacher provided, ensure no conflict: same teacher already teaching
        // another class at that time
        if (req.teacherDetailsId() != null) {
            Integer count = jdbc.queryForObject(
                    "select count(1) from timetable_slots where teacher_details_id = ? and day_of_week = ? and period_no = ? and not (class_id = ? and section_id = ?)",
                    Integer.class, req.teacherDetailsId(), req.dayOfWeek(), req.periodNo(), req.classId(), sectionId);
            if (count != null && count > 0) {
                return ResponseEntity.status(409).build();
            }
        }

        // If subject provided, ensure teacher (if provided) is eligible for this
        // class/section/subject
        if (req.subjectId() != null && req.teacherDetailsId() != null) {
            String sectionLetter = resolveSectionNameIfNeeded(String.valueOf(sectionId));
            Integer ok = jdbc.query(
                    "select 1 from teacher_subject_map ts join teacher_class_map tc on tc.teacher_details_id = ts.teacher_details_id and tc.class_id = ? and tc.section = ? where ts.teacher_details_id = ? and ts.subject_id = ?",
                    rs -> rs.next() ? 1 : 0,
                    req.classId(), sectionLetter, req.teacherDetailsId(), req.subjectId());
            if (ok == null || ok == 0) {
                return ResponseEntity.status(422).build();
            }
        }

        if (req.subjectId() != null)
            slot.setSubjectId(req.subjectId());
        if (req.teacherDetailsId() != null || (req.subjectId() != null && req.teacherDetailsId() == null)) {
            // allow clearing teacher by passing null explicitly
            slot.setTeacherDetailsId(req.teacherDetailsId());
        }
        if (req.locked() != null)
            slot.setLocked(req.locked());
        slot.setGeneratedBy("MANUAL");
        slotRepo.save(slot);

        // return refreshed grid
        List<TimetableSlot> slots = slotRepo.findByClassIdAndSectionIdOrderByDayOfWeekAscPeriodNoAsc(req.classId(),
                sectionId);
        int periodsPerDay = settingsRepo.findTopByOrderByIdAsc()
                .map(s -> Optional.ofNullable(s.getPeriodsPerDay()).orElse(8)).orElse(8);
        return ResponseEntity.ok(buildGridResponse(periodsPerDay, slots));
    }

    private SlotsResponse buildGridResponse(int periodsPerDay, List<TimetableSlot> slots) {
        List<String> days = Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri");
        Map<Integer, Map<Integer, GridCell>> grid = new HashMap<>();
        // initialize empty maps for known days (0-based keys expected by UI)
        for (int d = 0; d < days.size(); d++) {
            grid.put(d, new HashMap<>());
        }

        // Build lookup maps for display (safe for empty slots)
        Map<Long, String> subjectCodeById = new HashMap<>();
        Map<Long, String> teacherNameById = new HashMap<>();
        Map<Long, String> subjectNameById = new HashMap<>();
        try {
            jdbc.query("select id, code, name from subjects", rs -> {
                long id = rs.getLong(1);
                subjectCodeById.put(id, rs.getString(2));
                subjectNameById.put(id, rs.getString(3));
            });
        } catch (Exception ignore) {
            /* best-effort */ }
        try {
            jdbc.query(
                    "select td.id as id, coalesce(ss.first_name || ' ' || ss.last_name, cast(td.id as varchar)) as name "
                            +
                            "from teacher_details td left join school_staff ss on ss.teacher_details_id = td.id",
                    rs -> {
                        teacherNameById.put(rs.getLong(1), rs.getString(2));
                    });
        } catch (Exception ignore) {
            /* best-effort */ }
        for (TimetableSlot s : slots) {
            int dayIdx = Math.max(0, Math.min(4, s.getDayOfWeek() - 1)); // convert 1..5 to 0..4
            String subjCode = s.getSubjectId() != null ? subjectCodeById.get(s.getSubjectId()) : null;
            String teacherName = s.getTeacherDetailsId() != null ? teacherNameById.get(s.getTeacherDetailsId()) : null;
            String subjName = s.getSubjectId() != null ? subjectNameById.get(s.getSubjectId()) : null;
            grid.computeIfAbsent(dayIdx, k -> new HashMap<>())
                    .put(s.getPeriodNo(), new GridCell(
                            s.getSubjectId(),
                            s.getTeacherDetailsId(),
                            Boolean.TRUE.equals(s.getLocked()),
                            subjCode,
                            subjName,
                            teacherName));
        }
        return new SlotsResponse(periodsPerDay, days, grid);
    }

    private boolean isWorkingDay(int mask, int dayOfWeekIso) {
        // mask bit0=Mon .. bit4=Fri
        int bit = 1 << (dayOfWeekIso - 1);
        return (mask & bit) != 0;
    }

    private static Long pickTeacherFor(Long subjectId,
            int day,
            Map<Integer, Map<Long, Integer>> dayTeacherLoad,
            Map<Long, List<Long>> subjectTeachers,
            int maxPerTeacherPerDay) {
        List<Long> candidates = subjectTeachers.getOrDefault(subjectId, Collections.emptyList());
        if (candidates.isEmpty())
            return null;
        Map<Long, Integer> load = dayTeacherLoad.computeIfAbsent(day, k -> new HashMap<>());

        // Pick the least-loaded teacher with capacity
        return candidates.stream()
                .sorted(Comparator.comparingLong(t -> load.getOrDefault(t, 0)))
                .filter(t -> load.getOrDefault(t, 0) < maxPerTeacherPerDay)
                .findFirst()
                .orElse(null);
    }

    private static void markLoad(int day, Long teacherId, Map<Integer, Map<Long, Integer>> dayTeacherLoad) {
        Map<Long, Integer> load = dayTeacherLoad.computeIfAbsent(day, k -> new HashMap<>());
        load.put(teacherId, load.getOrDefault(teacherId, 0) + 1);
    }

    private Long resolveSectionIdIfNeeded(Long classId, String section) {
        // If 'section' is numeric, assume it's the sectionId already; else try to
        // derive from grade and name
        try {
            return Long.parseLong(section);
        } catch (NumberFormatException ignore) {
        }
        // Derive section id via grade levels and sections tables using exam's class
        // name
        String className = jdbc.queryForObject("select name from classes where id=?", String.class, classId);

        Integer grade = extractGradeNumber(className);
        if (grade == null)
            return null;
        String sql = "SELECT s.id FROM class_sections cs JOIN grade_levels gl ON cs.grade_id=gl.id " +
                "JOIN sections s ON cs.section_id = s.id WHERE gl.grade_number=? AND s.section_name=?";
        return jdbc.queryForObject(sql, (rs, rowNum) -> rs.getLong(1), grade, section);
    }

    private Integer extractGradeNumber(String className) {
        if (className == null)
            return null;
        String normalized = className.trim().toLowerCase();
        normalized = normalized.replace("class", "").replace("grade", "").trim();
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String resolveSectionNameIfNeeded(String sectionInput) {
        if (sectionInput == null || sectionInput.isBlank())
            return sectionInput;
        // If numeric, look up section name
        try {
            long sectionId = Long.parseLong(sectionInput);
            String name = jdbc.query(
                    "select section_name from sections where id = ?",
                    rs -> rs.next() ? rs.getString(1) : null,
                    sectionId);
            return name != null ? name : sectionInput; // fallback to input
        } catch (NumberFormatException ignore) {
            return sectionInput; // already a letter like 'A'
        }
    }
}
