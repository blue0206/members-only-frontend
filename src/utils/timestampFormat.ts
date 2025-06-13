export const getTimeElapsed = (timestamp: string | Date): string => {
  const timestampDate = new Date(timestamp);
  const currentDate = new Date();

  const secondsElapsed = Math.round(
    (currentDate.getTime() - timestampDate.getTime()) / 1000
  );
  if (secondsElapsed < 30) {
    return "Just now";
  } else if (secondsElapsed < 60) {
    return `${secondsElapsed.toString()} seconds ago`;
  }

  const minutesElapsed = Math.floor(secondsElapsed / 60);
  if (minutesElapsed === 1) {
    return `${minutesElapsed.toString()} minute ago`;
  }
  if (minutesElapsed < 60) {
    return `${minutesElapsed.toString()} minutes ago`;
  }

  const hoursElapsed = Math.floor(minutesElapsed / 60);
  if (hoursElapsed === 1) {
    return `${hoursElapsed.toString()} hour ago`;
  }
  if (hoursElapsed < 24) {
    return `${hoursElapsed.toString()} hours ago`;
  }

  const daysElapsed = Math.floor(hoursElapsed / 24);
  if (daysElapsed === 1) {
    return `${daysElapsed.toString()} day ago`;
  }
  if (daysElapsed < 30) {
    return `${daysElapsed.toString()} days ago`;
  }

  const monthsElapsed = Math.floor(daysElapsed / 30);
  if (monthsElapsed === 1) {
    return `${monthsElapsed.toString()} month ago`;
  }
  if (monthsElapsed < 12) {
    return `${monthsElapsed.toString()} months ago`;
  }

  const yearsElapsed = Math.floor(monthsElapsed / 12);
  if (yearsElapsed === 1) {
    return `${yearsElapsed.toString()} year ago`;
  }
  return `${yearsElapsed.toString()} years ago`;
};

export const getDateFromTimestamp = (timestamp: string | Date): string => {
  const timestampDate = new Date(timestamp);
  // DD-MM-YYYY
  const day = timestampDate.getDate().toString().padStart(2, "0");
  const month = (timestampDate.getMonth() + 1).toString().padStart(2, "0");
  const year = timestampDate.getFullYear().toString();

  return `${day}-${month}-${year}`;
};
