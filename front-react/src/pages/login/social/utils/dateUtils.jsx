export function getFourteenYearsAgoBoundary() {
    const today = new Date();
    const year = today.getFullYear() - 14;
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 0~11 → +1
    const day = today.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;  // ex) 2011-04-25
  }
  