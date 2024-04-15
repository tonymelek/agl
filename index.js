const usage = require('./usage.json');
const tariffs = require('./tariffs.json');



const consumption = usage.filter(item => item.RateTypeDescription === "Usage");
const peakConsumption = consumption.filter(item => {
    const hr = parseInt(item.StartDate.split(' ')[1].split(':')[0]);
    const isPM = /pm/i.test(item.StartDate);
    const hr24 = isPM ? hr + 12:hr;
    return hr24 >= tariffs.peakHours.start && hr24 <= tariffs.peakHours.end;
});
const offPeakConsumption = consumption.filter(item => {
    const hr = parseInt(item.StartDate.split(' ')[1].split(':')[0]);
    const isPM = /pm/i.test(item.StartDate);
    const hr24 = isPM ? hr + 12:hr;
    return hr24 < tariffs.peakHours.start || hr24 > tariffs.peakHours.end;
});

const solarExport = usage.filter(item => item.RateTypeDescription === "Solar");

const calculateCost = (consumption, rate) => {
    return consumption.reduce((acc, curr) => acc + curr.ProfileReadValue, 0) * rate;
}
let periodInDays = 0;
const calculateSolar = () => {
    const getTime = obj => new Date(obj.StartDate.split(' ')[0].split('/').reverse().join('-')).getTime();
    periodInDays = (getTime(usage.slice(-1)[0]) - getTime(usage[0])) / (1000 * 60 * 60 * 24) + 1;
    console.log("Period in days:", periodInDays);
    const solarKws = calculateCost(solarExport, 1);
    const normalized10kws = periodInDays * 10;
    const remainingKws = solarKws - normalized10kws;
    return normalized10kws * tariffs.feedInFirst10 + remainingKws * tariffs.feedInNormal;
}
const totalDailyCost = () => {
    const peakConsumptionCost = calculateCost(peakConsumption, tariffs.peakRate);
    const offPeakConsumptionCost = calculateCost(offPeakConsumption, tariffs.normalRate);
    console.log(peakConsumptionCost,offPeakConsumptionCost)
    console.log("Usage: $", (peakConsumptionCost + offPeakConsumptionCost).toFixed(2), "Solar: $", calculateSolar().toFixed(2), "Supply charge:", (tariffs.dailySupply * periodInDays).toFixed(2));
    console.log("Total Payable: $", (peakConsumptionCost + offPeakConsumptionCost - calculateSolar() + tariffs.dailySupply * periodInDays).toFixed(2));
}

totalDailyCost();