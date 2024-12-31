export function formatDate(dateString: string): string {
  const [month, day, year] = dateString.split("/").map(Number);
  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getOrdinalSuffix = (day: number): string => {
    if (day % 10 === 1 && day % 100 !== 11) {
      return "st";
    } else if (day % 10 === 2 && day % 100 !== 12) {
      return "nd";
    } else if (day % 10 === 3 && day % 100 !== 13) {
      return "rd";
    } else {
      return "th";
    }
  };

  const monthName = monthNames[month - 1];
  const ordinalDay = day + getOrdinalSuffix(day);

  return `${monthName} ${ordinalDay}, ${year}`;
}
