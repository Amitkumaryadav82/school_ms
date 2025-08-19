import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Typography, Chip, Stack } from '@mui/material';
import api from '../../services/api';

interface TeacherDetailsLite { id: number; display: string }
interface Subject { id: number; name: string; code?: string }

const TeacherSubjectMappingPage: React.FC = () => {
  const [teachers, setTeachers] = React.useState<TeacherDetailsLite[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teacherId, setTeacherId] = React.useState<number | ''>('');
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        // Build a simple teacher list from staff endpoint, picking only those with teacherDetails
        const staff = await api.get<any[]>('/api/staff');
        const tds: TeacherDetailsLite[] = [];
        staff.forEach(s => {
          if (s.teacherDetails && s.teacherDetails.id) {
            const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || `Staff #${s.id}`;
            tds.push({ id: s.teacherDetails.id, display: `${name} (ID ${s.teacherDetails.id})` });
          }
        });
        setTeachers(tds);
      } catch (e) {
        console.error('Failed to load teachers', e);
      }
      try {
        const subs = await api.get<Subject[]>('/api/exam/subjects');
        setSubjects(subs);
      } catch (e) {
        console.error('Failed to load subjects', e);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!teacherId) { setSelectedSubjectIds([]); return; }
      try {
        const mapped = await api.get<{ id: number; name: string }[]>(`/api/staff/teachers/${teacherId}/subjects`);
        setSelectedSubjectIds(mapped.map(m => m.id));
      } catch (e) {
        console.error('Failed to load mapped subjects', e);
        setSelectedSubjectIds([]);
      }
    })();
  }, [teacherId]);

  const save = async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      await api.put<void>(`/api/staff/teachers/${teacherId}/subjects`, selectedSubjectIds);
    } catch (e) {
      console.error('Failed to save mapping', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Teacher–Subject Mapping</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Teacher</InputLabel>
          <Select value={teacherId} label="Teacher" onChange={e => setTeacherId(Number(e.target.value))}>
            {teachers.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.display}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 300 }} disabled={!teacherId}>
          <InputLabel>Subjects</InputLabel>
          <Select
            multiple
            value={selectedSubjectIds}
            onChange={(e) => setSelectedSubjectIds(e.target.value as number[])}
            label="Subjects"
            renderValue={(selected) => (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(selected as number[]).map(id => {
                  const subj = subjects.find(s => s.id === id);
                  return <Chip key={id} label={subj ? (subj.code ? `${subj.code} - ${subj.name}` : subj.name) : id} />
                })}
              </Stack>
            )}
          >
            {subjects.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} - ${s.name}` : s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={save} disabled={!teacherId || loading}>Save</Button>
      </Box>
    </Paper>
  );
};

export default TeacherSubjectMappingPage;
