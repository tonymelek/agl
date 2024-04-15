const usage=require('./usage.json');
const tariffs=require('./tariffs.json');



const consumption=usage.filter(item=>item.RateTypeDescription==="Usage");
const peakConsumption=consumption.filter(item=>{
    const hr=item.StartDate.split(' ')[1].split(':')[0];
    return hr>=tariffs.peakHours.start &&hr<=tariffs.peakHours.end;
});
const offPeakConsumption=consumption.filter(item=>{
    const hr=item.StartDate.split(' ')[1].split(':')[0];
    return hr<tariffs.peakHours.start || hr>tariffs.peakHours.end;
});

const solarExport=usage.filter(item=>item.RateTypeDescription==="Solar");

const calculateCost=(consumption,rate)=>{
    return consumption.reduce((acc,curr)=>acc+curr.ProfileReadValue,0)*rate;
}
const calculateSolar=()=>{
    const getTime=obj=>new Date(obj.StartDate.split(' ')[0]).getTime();
    const periodInDays= (getTime(usage.slice(-1)[0])-getTime(usage[0]))/(1000*60*60*24)+1;
    console.log("Period in days:",periodInDays);
    const solarKws=calculateCost(solarExport,1);
    const normalized10kws=periodInDays*10;
    const remainingKws=solarKws-normalized10kws;
    return normalized10kws*tariffs.feedInFirst10+remainingKws*tariffs.feedInNormal;
}
const totalDailyCost=()=>{
    const peakConsumptionCost=calculateCost(peakConsumption,tariffs.peakRate);
    const offPeakConsumptionCost=calculateCost(offPeakConsumption,tariffs.normalRate);
    console.log("Usage: $",(peakConsumptionCost+offPeakConsumptionCost).toFixed(2),"Solar: $",calculateSolar().toFixed(2),"Supply charge:",tariffs.dailySupply.toFixed(2));
    console.log("Total Payable: $", (peakConsumptionCost+offPeakConsumptionCost-calculateSolar()+tariffs.dailySupply).toFixed(2));
}

totalDailyCost();