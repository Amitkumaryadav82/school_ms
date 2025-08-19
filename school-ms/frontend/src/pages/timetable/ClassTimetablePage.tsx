import React from 'react';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert } from '@mui/material';
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
  const [loading, setLoading] = React.useState(false);

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
      <TimetableGrid days={days} periods={periods} data={gridData as any} />
    </Paper>
  );
};

export default ClassTimetablePage;
