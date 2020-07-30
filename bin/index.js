#!/usr/bin.env node
/* 
Note: To Run Locally: 
1. Install node and npm
2. Install  npm node-fetch
3. node bin/index.js
*/

const fetch = require('node-fetch'); 
const Table = require('cli-table3');
const url = "https://data.sfgov.org/resource/jjew-r69b.json";
const table = new Table({
    head: ['NAME', 'ADDRESS','OPERATION HOURS']
    , colWidths: [70, 30,20]
  });

  //Function to return the current' users time in PST(SF time);
const getPacificTime = ()=> {
    const userTime = new Date();
    const diff = 420*60*1000;
    const delta = userTime - diff;
    return new Date(delta);
}

//Function to Sort the Results Array:
const  sortResult = (arr)=> {
    const sortArr = arr.sort((a, b) => {
        if(a[0] > b[0])
        return 1;
      if(a[0] < b[0])
        return -1;
      return 0;
    });
    return sortArr;
  }


//Function that fetches the Data from the API
const getData = async(url)=> {

    try {
        const result = []; // Array to Store Sorted List
        const response = await fetch(url);
        const parsedResponse = await response.json();
        
        // Get the currentTime and Date

        const currentTime = getPacificTime();
        let currentDay = currentTime.getUTCDay();
        let currentHour = currentTime.getUTCHours();

        //Map through parsedResponse based on requirements: Current Date and Current time

        parsedResponse.map(index => {
            //Convert from String to Integer to help with Strict Comparison
            const dayOrder = parseInt(index.dayorder);
            const start24 = parseInt(index.start24);
            const end24 = parseInt(index.end24);
    

            //conditional check to know THE food stucks are open at the current date and time: 
            if(currentDay === dayOrder && currentHour >= start24 && currentHour < end24){
                result.push([index.applicant, index.location, index.start24 + " - " + index.end24]);
            }
        })
            const sortedResult = sortResult(result); // Call Sort Result Function on the Result's array:
            printResult(sortedResult);
        
    } catch (error) {
        console.log(error);
    }
}

const printResult = (arr, defaultVal = 10)=> {
    if(arr.length == 0){
        console.log("There are no food trucks available at this current time");
        process.exit(); // Exits the Node.js Process
    }

    let count; 
    let resultCount = arr.length; // Original Length of Results arr Based on the stores open at the current time and date: 
    console.log(resultCount, " BEFORE");
    for(count = 0; count <(resultCount >= defaultVal ? defaultVal: resultCount) ; count++){
        table.push(arr[count]);
    }
    console.log(table.toString());
    console.log(resultCount, "default Value", defaultVal);
    if(resultCount > defaultVal){
        //Request Users Input if they want to see more of the dataSet or not
        process.stdout.write("Do you want to see more Results [Y/N] ? : ");
        process.stdin.on("data", (data)=>{
        data = data.toString().trim();
            if(data =='y' || data=='Y'|| data == 'yes' || data== 'YES'){
                let newCount  = count + defaultVal >resultCount? resultCount: count+defaultVal;
                //Add the next Set of 10 to the Table arr
                for(count; count < newCount;count++)
                    table[count%defaultVal] = arr[count];

                for(count;count%defaultVal!=0;count++)
                    table.pop();
                console.log(table.toString());
                if(count < resultCount) 
                    process.stdout.write("Do you want more results [Y/N]? : ")
                    else 
                        process.exit();
            }
           else if(data =='n' || data=='N'|| data == 'no' || data == 'NO'){
               process.exit();
           }
           else{
               console.log("Try Again");
           }
        })
    }
}

getData(url);


