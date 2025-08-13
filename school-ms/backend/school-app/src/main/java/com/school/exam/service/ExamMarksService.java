package com.school.exam.service;

import com.school.exam.dto.QuestionMarkDTO;
import com.school.exam.dto.StudentMarksDTO;
import com.school.exam.dto.MarksMatrixResponse;
import com.school.exam.dto.MarksMatrixSaveRequest;
import com.school.exam.model.ExamMarkDetail;
import com.school.exam.model.ExamMarkSummary;
import com.school.exam.model.QuestionPaperFormat;
import com.school.exam.model.Subject;
import com.school.exam.repository.SubjectRepository;
import com.school.exam.repository.ExamMarkDetailRepository;
import com.school.exam.repository.ExamMarkSummaryRepository;
import com.school.exam.repository.QuestionPaperFormatRepository;
import com.school.student.model.Student;
import com.school.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExamMarksService {
    private final ExamMarkSummaryRepository summaryRepo;
    private final ExamMarkDetailRepository detailRepo;
    private final QuestionPaperFormatRepository qpfRepo;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public ExamMarksService(ExamMarkSummaryRepository summaryRepo, ExamMarkDetailRepository detailRepo, QuestionPaperFormatRepository qpfRepo, StudentRepository studentRepository, SubjectRepository subjectRepository) {
        this.summaryRepo = summaryRepo;
        this.detailRepo = detailRepo;
        this.qpfRepo = qpfRepo;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    private String determineType(QuestionPaperFormat q) {
        // TODO: If subject metadata exists, use that; for now infer from unit name keywords
        String unit = q.getUnitName() == null ? "" : q.getUnitName().toLowerCase();
        if (unit.contains("prac") || unit.contains("lab") || unit.contains("experiment")) {
            return "PRACTICAL";
        }
        return "THEORY";
    }

    @Transactional(readOnly = true)
    public StudentMarksDTO getStudentMarks(Long examId, Long classId, Long subjectId, Long studentId) {
        Optional<ExamMarkSummary> existing = summaryRepo.findByExamIdAndSubjectIdAndStudentId(examId, subjectId, studentId);
        List<QuestionPaperFormat> qpfList = qpfRepo.findByExamIdAndClassIdAndSubjectId(examId, classId, subjectId);

        StudentMarksDTO dto = new StudentMarksDTO();
        dto.setExamId(examId);
        dto.setSubjectId(subjectId);
        dto.setStudentId(studentId);
        dto.setStudentName("");
        dto.setRollNumber("");
        dto.setTotalTheoryMarks(0.0);
        dto.setTotalPracticalMarks(0.0);

        // Build question marks from QPF
        List<QuestionMarkDTO> questionMarks = qpfList.stream().map(q -> {
            QuestionMarkDTO qm = new QuestionMarkDTO();
            qm.setQuestionId(q.getId());
            qm.setQuestionNumber(q.getQuestionNumber());
            qm.setChapterName(q.getUnitName());
            qm.setMaxMarks(q.getMarks());
            qm.setQuestionType(determineType(q));
            qm.setObtainedMarks(0.0);
            qm.setEvaluatorComments("");
            return qm;
        }).collect(Collectors.toList());

        if (existing.isPresent()) {
            ExamMarkSummary summary = existing.get();
            dto.setAbsent(Boolean.TRUE.equals(summary.getIsAbsent()));
            dto.setAbsenceReason(summary.getAbsenceReason());
            dto.setTotalTheoryMarks(summary.getTotalTheoryMarks() == null ? 0.0 : summary.getTotalTheoryMarks());
            dto.setTotalPracticalMarks(summary.getTotalPracticalMarks() == null ? 0.0 : summary.getTotalPracticalMarks());

            List<ExamMarkDetail> details = detailRepo.findBySummaryId(summary.getId());
            // Merge into questionMarks by questionFormatId
            for (QuestionMarkDTO qm : questionMarks) {
                for (ExamMarkDetail d : details) {
                    if (qm.getQuestionId().equals(d.getQuestionFormatId())) {
                        qm.setObtainedMarks(d.getObtainedMarks());
                        qm.setEvaluatorComments(d.getEvaluatorComments());
                    }
                }
            }
        }

        // compute max buckets
        double maxTheory = questionMarks.stream().filter(q -> "THEORY".equalsIgnoreCase(q.getQuestionType())).mapToDouble(q -> q.getMaxMarks() == null ? 0 : q.getMaxMarks()).sum();
        double maxPractical = questionMarks.stream().filter(q -> "PRACTICAL".equalsIgnoreCase(q.getQuestionType())).mapToDouble(q -> q.getMaxMarks() == null ? 0 : q.getMaxMarks()).sum();
        dto.setMaxTheoryMarks(maxTheory);
        dto.setMaxPracticalMarks(maxPractical);
        dto.setQuestionMarks(questionMarks);
        return dto;
    }

    @Transactional
    public void saveStudentMarks(StudentMarksDTO dto) {
        ExamMarkSummary summary = summaryRepo.findByExamIdAndSubjectIdAndStudentId(dto.getExamId(), dto.getSubjectId(), dto.getStudentId())
                .orElseGet(ExamMarkSummary::new);
        summary.setExamId(dto.getExamId());
        summary.setSubjectId(dto.getSubjectId());
        summary.setStudentId(dto.getStudentId());
        summary.setIsAbsent(dto.isAbsent());
        summary.setAbsenceReason(dto.getAbsenceReason());
        summary.setTotalTheoryMarks(dto.getTotalTheoryMarks());
        summary.setTotalPracticalMarks(dto.getTotalPracticalMarks());
        summary.setUpdatedAt(LocalDateTime.now());
        ExamMarkSummary saved = summaryRepo.save(summary);

        // Save details (upsert by questionFormatId)
        List<ExamMarkDetail> existing = detailRepo.findBySummaryId(saved.getId());
        for (QuestionMarkDTO qm : dto.getQuestionMarks()) {
            ExamMarkDetail det = existing.stream()
                    .filter(d -> d.getQuestionFormatId().equals(qm.getQuestionId()))
                    .findFirst()
                    .orElseGet(ExamMarkDetail::new);
            det.setSummary(saved);
            det.setQuestionFormatId(qm.getQuestionId());
            det.setQuestionNumber(qm.getQuestionNumber());
            det.setUnitName(qm.getChapterName());
            det.setQuestionType(qm.getQuestionType());
            det.setMaxMarks(qm.getMaxMarks());
            det.setObtainedMarks(qm.getObtainedMarks());
            det.setEvaluatorComments(qm.getEvaluatorComments());
            det.setUpdatedAt(LocalDateTime.now());
            detailRepo.save(det);
        }
    }

    @Transactional
    public void lockMarks(Long examId, Long subjectId, List<Long> studentIds) {
        for (Long studentId : studentIds) {
            summaryRepo.findByExamIdAndSubjectIdAndStudentId(examId, subjectId, studentId).ifPresent(summary -> {
                summary.setLocked(true);
                summary.setUpdatedAt(LocalDateTime.now());
                summaryRepo.save(summary);
            });
        }
    }

    @Transactional
    public void editLockedMark(Long examId, Long subjectId, Long studentId, Long questionFormatId, Double newMarks, String reason) {
        ExamMarkSummary summary = summaryRepo.findByExamIdAndSubjectIdAndStudentId(examId, subjectId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Marks not found"));
        List<ExamMarkDetail> details = detailRepo.findBySummaryId(summary.getId());
        for (ExamMarkDetail d : details) {
            if (d.getQuestionFormatId().equals(questionFormatId)) {
                d.setObtainedMarks(newMarks);
                d.setLastEditReason(reason);
                d.setLastEditAt(LocalDateTime.now());
                detailRepo.save(d);
                break;
            }
        }
    }

    @Transactional
    public void bulkUpdate(Long examId, Long classId, Long subjectId, List<com.school.exam.dto.BulkMarksUpdateRequest.BulkMarkItem> updates) {
        // Group by student and upsert details
        for (var item : updates) {
            ExamMarkSummary summary = summaryRepo
                    .findByExamIdAndSubjectIdAndStudentId(examId, subjectId, item.getStudentId())
                    .orElseGet(ExamMarkSummary::new);
            summary.setExamId(examId);
            summary.setClassId(classId);
            summary.setSubjectId(subjectId);
            summary.setStudentId(item.getStudentId());
            summary.setUpdatedAt(LocalDateTime.now());
            summary = summaryRepo.save(summary);

            List<ExamMarkDetail> existing = detailRepo.findBySummaryId(summary.getId());
            ExamMarkDetail det = existing.stream()
                    .filter(d -> d.getQuestionFormatId().equals(item.getQuestionFormatId()))
                    .findFirst().orElseGet(ExamMarkDetail::new);
            det.setSummary(summary);
            det.setQuestionFormatId(item.getQuestionFormatId());
            // Fetch QPF to fill in metadata if new
            qpfRepo.findById(item.getQuestionFormatId()).ifPresent(q -> {
                det.setQuestionNumber(q.getQuestionNumber());
                det.setUnitName(q.getUnitName());
                det.setQuestionType(determineType(q));
                det.setMaxMarks(q.getMarks());
            });
            det.setObtainedMarks(item.getObtainedMarks());
            det.setEvaluatorComments(item.getEvaluatorComments());
            det.setUpdatedAt(LocalDateTime.now());
            detailRepo.save(det);
        }
    }

    @Transactional(readOnly = true)
    public MarksMatrixResponse getMarksMatrix(Long examId, Long classId, Integer grade, String section) {
        // Subjects constrained to QPF for exam/class
    List<Long> subjectIds = qpfRepo.findDistinctSubjectIdsByExamIdAndClassId(examId, classId);
    List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        List<MarksMatrixResponse.SubjectColumn> cols = subjects.stream().map(s -> {
            MarksMatrixResponse.SubjectColumn c = new MarksMatrixResponse.SubjectColumn();
            c.setSubjectId(s.getId());
            c.setSubjectName(s.getName());
            double totalMax = qpfRepo.findByExamIdAndClassIdAndSubjectId(examId, classId, s.getId())
                    .stream().mapToDouble(q -> q.getMarks() == null ? 0.0 : q.getMarks()).sum();
            c.setTotalMaxMarks(totalMax);
            return c;
        }).collect(Collectors.toList());

        // Students in grade/section
        List<Student> students = studentRepository.findByGradeAndSection(grade, section);
        List<MarksMatrixResponse.StudentRow> rows = students.stream().map(st -> {
            MarksMatrixResponse.StudentRow r = new MarksMatrixResponse.StudentRow();
            r.setStudentId(st.getId());
            r.setStudentName(st.getFirstName() + " " + st.getLastName());
            r.setRollNumber(st.getRollNumber());
            List<MarksMatrixResponse.StudentSubjectCell> cells = cols.stream().map(c -> {
                MarksMatrixResponse.StudentSubjectCell cell = new MarksMatrixResponse.StudentSubjectCell();
                cell.setSubjectId(c.getSubjectId());
                // Pull summary totals if present
                Optional<ExamMarkSummary> sumOpt = summaryRepo.findByExamIdAndSubjectIdAndStudentId(examId, c.getSubjectId(), st.getId());
                sumOpt.ifPresent(sum -> {
                    cell.setAbsent(Boolean.TRUE.equals(sum.getIsAbsent()));
                    cell.setAbsenceReason(sum.getAbsenceReason());
                    cell.setTheoryMarks(sum.getTotalTheoryMarks());
                    cell.setPracticalMarks(sum.getTotalPracticalMarks());
                });
                return cell;
            }).collect(Collectors.toList());
            r.setCells(cells);
            return r;
        }).collect(Collectors.toList());

        MarksMatrixResponse resp = new MarksMatrixResponse();
        resp.setSubjects(cols);
        resp.setStudents(rows);
        return resp;
    }

    @Transactional
    public void saveMarksMatrix(MarksMatrixSaveRequest request) {
        Long examId = request.getExamId();
        Long classId = request.getClassId();

        for (MarksMatrixSaveRequest.Row row : request.getRows()) {
            Long studentId = row.getStudentId();
            for (MarksMatrixSaveRequest.Cell cell : row.getSubjects()) {
                Long subjectId = cell.getSubjectId();

                // Validate theory+practical <= exam total for the subject (from QPF sum)
                double totalMax = qpfRepo.findByExamIdAndClassIdAndSubjectId(examId, classId, subjectId)
                        .stream().mapToDouble(q -> q.getMarks() == null ? 0.0 : q.getMarks()).sum();
                double theory = cell.getTheoryMarks() == null ? 0.0 : cell.getTheoryMarks();
                double practical = cell.getPracticalMarks() == null ? 0.0 : cell.getPracticalMarks();
                if (theory + practical > totalMax + 1e-9) {
                    throw new IllegalArgumentException("Marks exceed total for subject " + subjectId + ": " + (theory + practical) + "/" + totalMax);
                }

                ExamMarkSummary summary = summaryRepo
                        .findByExamIdAndSubjectIdAndStudentId(examId, subjectId, studentId)
                        .orElseGet(ExamMarkSummary::new);
                summary.setExamId(examId);
                summary.setClassId(classId);
                summary.setSubjectId(subjectId);
                summary.setStudentId(studentId);
                summary.setIsAbsent(Boolean.TRUE.equals(cell.getAbsent()));
                summary.setAbsenceReason(cell.getAbsenceReason());
                summary.setTotalTheoryMarks(cell.getTheoryMarks());
                summary.setTotalPracticalMarks(cell.getPracticalMarks());
                summary.setUpdatedAt(LocalDateTime.now());
                summaryRepo.save(summary);
            }
        }
    }
}
