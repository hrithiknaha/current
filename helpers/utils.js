const searchAppender = (queryString) => {
    const lowercaseQuery = queryString.toLowerCase();
    const queries = lowercaseQuery.split(" ");
    const query = queries.join("+");

    return query;
};

const getWeekday = (key) => {
    switch (key) {
        case 0:
            return "Sun";
        case 1:
            return "Mon";
        case 2:
            return "Tue";
        case 3:
            return "Wed";
        case 4:
            return "Thu";
        case 5:
            return "Fri";
        case 6:
            return "Sat";
        default:
            break;
    }
};

const getMonth = (key) => {
    switch (key) {
        case 0:
            return "Jan";
        case 1:
            return "Feb";
        case 2:
            return "Mar";
        case 3:
            return "Apr";
        case 4:
            return "May";
        case 5:
            return "Jun";
        case 6:
            return "Jul";
        case 7:
            return "Aug";
        case 8:
            return "Sep";
        case 9:
            return "Oct";
        case 10:
            return "Nov";
        case 11:
            return "Dec";
        default:
            break;
    }
};

const getHourAsAMPM = (key) => {
    switch (key) {
        case 0:
            return "12am";
        case 1:
            return "1am";
        case 2:
            return "2am";
        case 3:
            return "3am";
        case 4:
            return "4am";
        case 5:
            return "5am";
        case 6:
            return "6am";
        case 7:
            return "7am";
        case 8:
            return "8am";
        case 9:
            return "9am";
        case 10:
            return "10am";
        case 11:
            return "11am";
        case 12:
            return "12pm";
        case 13:
            return "1pm";
        case 14:
            return "2pm";
        case 15:
            return "3pm";
        case 16:
            return "4pm";
        case 17:
            return "5pm";
        case 18:
            return "6pm";
        case 19:
            return "7pm";
        case 20:
            return "8pm";
        case 21:
            return "9pm";
        case 22:
            return "10pm";
        case 23:
            return "11pm";
        default:
            break;
    }
};

module.exports = { searchAppender, getWeekday, getMonth, getHourAsAMPM };
