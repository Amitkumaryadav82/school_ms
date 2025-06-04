package com.school.course.service;

import com.school.course.model.Chapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChapterService {

    @Autowired
    private ChapterRepository chapterRepository;

    public Chapter createChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    public Chapter updateChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    public Chapter getChapter(Long id) {
        return chapterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chapter not found with id: " + id));
    }

    public List<Chapter> getAllChapters() {
        return chapterRepository.findAll();
    }

    public List<Chapter> getChaptersBySubject(String subject) {
        return chapterRepository.findBySubject(subject);
    }

    public List<Chapter> getChaptersByGrade(Integer grade) {
        return chapterRepository.findByGrade(grade);
    }

    public List<Chapter> getChaptersBySubjectAndGrade(String subject, Integer grade) {
        return chapterRepository.findBySubjectAndGrade(subject, grade);
    }

    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
    }
}
