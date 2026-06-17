require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const Pdf = require('../models/Pdf');

async function seedPdfs() {
  try {
    await connectDB();
    
    const pdfDir = path.join(__dirname, '../../../pdf');
    if (!fs.existsSync(pdfDir)) {
      console.log('PDF directory not found at', pdfDir);
      process.exit(1);
    }
    
    const files = fs.readdirSync(pdfDir);
    
    for (const file of files) {
      if (!file.endsWith('.pdf')) continue;
      
      // Determine category based on filename
      let category = 'Academics';
      const lowerName = file.toLowerCase();
      if (lowerName.includes('general')) {
        category = 'General';
      } else if (lowerName.includes('academic')) {
        category = 'Academics';
      } else {
        // Look at the contents or name to guess, otherwise default to Academics since it's more common in IELTS
        category = 'Academics';
      }
      
      // Check if it already exists
      const existing = await Pdf.findOne({ filename: file });
      if (!existing) {
        // Clean up title (remove .pdf and maybe some ugly parts)
        let title = file.replace('.pdf', '').trim();
        const pdf = new Pdf({
          title: title,
          filename: file,
          category: category
        });
        await pdf.save();
        console.log(`Added: ${file} => ${category}`);
      } else {
        console.log(`Skipped (already exists): ${file}`);
      }
    }
    
    console.log('Finished seeding PDFs.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedPdfs();
