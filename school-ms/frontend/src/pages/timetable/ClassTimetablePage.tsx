import React from 'react';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, TextField, Stack } from '@mui/material';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import timetableService from '../../services/timetableService';
import timetableApi from '../../services/timetableApi';
import api from '../../services/api';

interface ClassItem { id: number; name: string }

const days = ['Mon','Tue','Wed','Thu','Fri'];

const ClassTimetablePage: React.FC = () => {
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [classId, setClassId] = React.useState<number | ''>('');
  const [sections, setSections] = React.useState<string[]>([]);
  const [section, setSection] = React.useState<string>('');
  const [periods, setPeriods] = React.useState<number>(8);
  const [gridData, setGridData] = React.useState<Record<number, Record<number, { subject?: string; teacher?: string }>>>({});
  const [rawGrid, setRawGrid] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editDayIdx, setEditDayIdx] = React.useState<number | null>(null);
  const [editPeriod, setEditPeriod] = React.useState<number | null>(null);
  const [subjects, setSubjects] = React.useState<{ id: number; code: string; name: string }[]>([]);
  const [teachers, setTeachers] = React.useState<{ id: number; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = React.useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = React.useState<number | ''>('');
  const [saving, setSaving] = React.useState(false);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const [optionsError, setOptionsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
  // Timetable should list ALL classes, not just those with exam configs
  const cls = await api.get<ClassItem[]>('/api/classes');
  setClasses(cls);
  if (cls.length) setClassId(cls[0].id);
      } catch (e) {
        console.error('Failed to load classes', e);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await timetableService.getSettings();
        if (s?.periods_per_day) setPeriods(s.periods_per_day);
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!classId) { setSections([]); setSection(''); return; }
      try {
        const secs = await timetableService.getClassSections(Number(classId));
        setSections(secs);
        if (secs.length) setSection(secs[0]);
      } catch (e) {
        console.error('Failed to load sections', e);
      }
    })();
  }, [classId]);

  const loadSlots = React.useCallback(async () => {
    if (!classId || !section) return;
    try {
      setLoading(true);
    const resp = await timetableApi.getSlots(Number(classId), section);
      setPeriods(resp.periodsPerDay || periods);
      // For now, subject/teacher names are not returned; keep IDs hidden
      // Map numeric day index grid to UI grid as-is
  const mapped: Record<number, Record<number, { subject?: string; teacher?: string }>> = {};
  setRawGrid(resp.grid || {});
  Object.entries(resp.grid || {}).forEach(([dayIdx, perMap]) => {
        const day = Number(dayIdx);
        mapped[day] = {} as any;
        Object.entries(perMap as any).forEach(([pStr, cell]: any) => {
          const p = Number(pStr);
      const subject = cell.subjectName || cell.subjectCode || (cell.subjectId ? `Sub #${cell.subjectId}` : '');
      const teacher = cell.teacherName || (cell.teacherDetailsId ? `Tch #${cell.teacherDetailsId}` : '');
      mapped[day][p] = { subject, teacher };
        });
      });
      setGridData(mapped);
    } catch (e) {
      console.error('Failed to load slots', e);
      setGridData({});
    } finally {
      setLoading(false);
    }
  }, [classId, section, periods]);

  React.useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const onGenerate = async () => {
    if (!classId || !section) return;
    try {
      setLoading(true);
      await timetableApi.generate(Number(classId), section, true);
      await loadSlots();
    } catch (e) {
      console.error('Generate failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Class Timetable</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select value={classId} label="Class" onChange={(e) => setClassId(Number(e.target.value))}>
            {classes.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!sections.length}>
          <InputLabel>Section</InputLabel>
          <Select value={section} label="Section" onChange={(e) => setSection(String(e.target.value))}>
            {sections.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Tip: Configure Timetable Settings first. Teacher ↔ Subject/Class mappings are managed in Staff and are used here to constrain valid assignments.
      </Alert>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" onClick={onGenerate} disabled={!classId || !section || loading}>Generate timetable</Button>
        <Button variant="outlined" disabled>Export XLSX</Button>
        <Button variant="outlined" disabled>Print</Button>
      </Box>
      <TimetableGrid
        days={days}
        periods={periods}
        data={gridData as any}
        onCellClick={async (dayIdx: number, periodNo: number) => {
          if (!classId || !section) return;
          setEditDayIdx(dayIdx);
          setEditPeriod(periodNo);
          // Preselect current subject/teacher if present
          const current = (rawGrid?.[dayIdx]?.[periodNo]) || {};
          setSelectedSubject(current.subjectId || '');
          setSelectedTeacher(current.teacherDetailsId || '');
          setEditOpen(true);
          try {
            setOptionsLoading(true);
            setOptionsError(null);
            const subs = await timetableApi.getAvailableSubjects(Number(classId), section);
            setSubjects(subs);
            setTeachers([]);
            if (current.subjectId) {
              try {
                const tchs = await timetableApi.getEligibleTeachers(Number(classId), section, Number(current.subjectId));
                setTeachers(tchs);
              } catch {}
            }
          } catch (e) {
            console.error('Failed to load options', e);
            setSubjects([]);
            setTeachers([]);
            setOptionsError('Failed to load subjects. Please retry.');
          } finally {
            setOptionsLoading(false);
          }
        }}
      />

  <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Slot</DialogTitle>
    <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Day"
              size="small"
              fullWidth
              value={editDayIdx != null ? days[editDayIdx] : ''}
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
      margin="normal"
            />
            <TextField
              label="Period"
              size="small"
              fullWidth
              value={editPeriod ?? ''}
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
      margin="normal"
            />
            {optionsLoading && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} /> <span>Loading subjects…</span></Box>}
            {!optionsLoading && optionsError && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                {optionsError} <Button size="small" onClick={async () => {
                  if (!classId || !section) return;
                  try {
                    setOptionsLoading(true);
                    setOptionsError(null);
                    const subs = await timetableApi.getAvailableSubjects(Number(classId), section);
                    setSubjects(subs);
                  } catch (e) {
                    setOptionsError('Still cannot load subjects.');
                  } finally {
                    setOptionsLoading(false);
                  }
                }}>Retry</Button>
              </Alert>
            )}
            <FormControl size="small" fullWidth margin="dense">
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={async (e) => {
                  const subjId = Number(e.target.value);
                  setSelectedSubject(subjId);
                  setSelectedTeacher('');
                  try {
                    setOptionsLoading(true);
                    const tchs = await timetableApi.getEligibleTeachers(Number(classId), section, subjId);
                    setTeachers(tchs);
                  } catch (err) {
                    console.error('Failed to load teachers', err);
                    setTeachers([]);
                    setOptionsError('Failed to load teachers for this subject.');
                  } finally {
                    setOptionsLoading(false);
                  }
                }}
              >
                {subjects.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.code} - {s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!optionsLoading && !optionsError && subjects.length === 0 && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                No subjects configured for this class/section. Configure Timetable Requirements first.
              </Alert>
            )}
            <FormControl size="small" fullWidth margin="dense" disabled={!selectedSubject}>
              <InputLabel>Teacher</InputLabel>
              <Select value={selectedTeacher} label="Teacher" onChange={(e) => setSelectedTeacher(Number(e.target.value))}>
                {teachers.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!classId || !section || editDayIdx == null || editPeriod == null || !selectedSubject || !selectedTeacher || saving}
            onClick={async () => {
              if (!classId || !section || editDayIdx == null || editPeriod == null || !selectedSubject) return;
              setSaving(true);
              try {
                const payload = {
                  classId: Number(classId),
                  section: String(section),
                  dayOfWeek: Number(editDayIdx) + 1,
                  periodNo: Number(editPeriod),
                  subjectId: Number(selectedSubject),
                  teacherDetailsId: selectedTeacher ? Number(selectedTeacher) : null
                };
                await timetableApi.updateSlot(payload);
                await loadSlots();
                setEditOpen(false);
              } catch (e: any) {
                const status = e?.response?.status;
                if (status === 409) alert('Teacher has a conflict in this timeslot or slot is locked.');
                else if (status === 422) alert('Selected teacher is not eligible for this subject/class/section.');
                else alert('Failed to update slot.');
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ClassTimetablePage;
