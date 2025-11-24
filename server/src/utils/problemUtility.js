import axios from 'axios';

const waitOneSecond = (timer)=>{
    setTimeout(()=>{
        return 1;
    },timer)
};

const getLanguageId = (language)=>{
    const languages = {
        "c":110,
        "c++":105,
        "python":109,
        "java":91,
        "javascript":102,
        "c#":51

    }

    return languages[language.toLowerCase()];
}


const getSubmitResult = async(submissions)=>{
    

const options = {
     method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': '810af14edbmsh572d88019cfd2acp12970djsn3271a507db54',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
    data: {
         submissions
    }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();
}

const getStatusCode = async(resultTokens)=>{
    
const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens:resultTokens.join(','),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '810af14edbmsh572d88019cfd2acp12970djsn3271a507db54',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}


while(true){
    const result =  await fetchData();

    const isObtainResult = result.submissions.every((items)=>items.status_id > 2);


    if(isObtainResult){
        return result.submissions;
    }

    waitOneSecond(1000);
}

}


export {getLanguageId,getSubmitResult,getStatusCode};