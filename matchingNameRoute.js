const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const pool = require('./db');

const mongoURL = 'mongodb://localhost:27017/jobSearchDB'; // or your MongoDB Atlas UR

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

const jobSchema = new mongoose.Schema({ description: String });
const resumeSchema = new mongoose.Schema({ description: String });

jobSchema.index({ description: 'text' });
resumeSchema.index({ description: 'text' });

const Job = mongoose.model('Job', jobSchema);
const Resume = mongoose.model('Resume', resumeSchema);

router.post('/matching-name', async (req, res) => {
  const { searchType, query } = req.body;
  try {
    let results;
    if (searchType === 'job-to-resume') {
      // MongoDB search for job descriptions matching the query
      results = await Resume.find({ $text: { $search: query } }).limit(5);
    } else if (searchType === 'resume-to-job') {
      // MongoDB search for resumes matching the query
      results = await Job.find({ $text: { $search: query } }).limit(5);
    } else if (searchType === 'job-to-resume-postgres') {
      // PostgreSQL search for job descriptions matching the query
      const { rows } = await pool.query(
        `SELECT * FROM resumes WHERE description % $1 ORDER BY similarity(description, $1) DESC LIMIT 5`,
        [query]
      );
      results = rows;
    } else if (searchType === 'resume-to-job-postgres') {
      // PostgreSQL search for resumes matching the query
      const { rows } = await pool.query(
        `SELECT * FROM job_descriptions WHERE description % $1 ORDER BY similarity(description, $1) DESC LIMIT 5`,
        [query]
      );
      results = rows;
    } else {
      return res.status(400).json({ error: 'Invalid search type' });
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
