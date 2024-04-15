const tariffs = {
    "peakHours": { "start": 15, "end": 21 },
    "peakRate": 0.37488,
    "normalRate": 0.24244,
    "dailySupply": 0.98406,
    "feedInFirst10": 0.1,
    "feedInNormal": 0.049
};


let periodInDays = 0;
const calculateCost = (consumption, rate) => {
    return consumption.reduce((acc, curr) => acc + parseFloat(curr.ProfileReadValue), 0) * rate;
}
const calculateSolar = (solarExport) => {
    const formatDate = obj => new Date(obj.StartDate.split(' ')[0].split('/').reverse().join('-')).getTime();
    periodInDays = (formatDate(usage.slice(-1)[0]) - formatDate(usage[0])) / (1000 * 60 * 60 * 24) + 1;
    console.log("Period in days:", periodInDays);
    const solarKws = calculateCost(solarExport, 1);
    const normalized10kws = periodInDays * 10;
    const remainingKws = solarKws - normalized10kws;
    return normalized10kws * tariffs.feedInFirst10 + remainingKws * tariffs.feedInNormal;
}
const totalDailyCost = () => {
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
    const solarExportCost = calculateSolar(solarExport);
    const peakConsumptionCost = calculateCost(peakConsumption, tariffs.peakRate);
    const offPeakConsumptionCost = calculateCost(offPeakConsumption, tariffs.normalRate);
    const supplyCharge = tariffs.dailySupply * periodInDays;
    const netCost = peakConsumptionCost + offPeakConsumptionCost + supplyCharge - solarExportCost;
    document.querySelector('tr#results').innerHTML = `
    <td>${periodInDays}</td>
    <td>$${solarExportCost.toFixed(2)}</td>
    <td>$${peakConsumptionCost.toFixed(2)}</td>
    <td>$${offPeakConsumptionCost.toFixed(2)}</td>
    <td>$${supplyCharge.toFixed(2)}</td>
    <td>$${netCost.toFixed(2)}</td>`;

    console.log("Usage: $", (peakConsumptionCost + offPeakConsumptionCost).toFixed(2), "Solar: $", calculateSolar(solarExport).toFixed(2), "Supply charge:", (tariffs.dailySupply * periodInDays).toFixed(2));
    console.log("Total Payable: $", (peakConsumptionCost + offPeakConsumptionCost - calculateSolar(solarExport) + tariffs.dailySupply * periodInDays).toFixed(2));
}
