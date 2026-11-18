const fs = require('fs');
const path = require('path');
const files = [
  'UniversityManagement.tsx', 
  'UniversityDetail.tsx', 
  'ScanSuccess.tsx', 
  'Point.tsx', 
  'Dashboard.tsx', 
  'AdminLeaderboard.tsx'
];
files.forEach(f => {
  const p = path.join('src/pages', f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/http:\/\/:8000\/storage/g, 'http://${window.location.hostname}:8000/storage');
  fs.writeFileSync(p, c);
  console.log('Updated ' + f);
});
