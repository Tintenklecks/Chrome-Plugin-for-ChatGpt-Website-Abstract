alert("klsdjfdslkfsldkf");
const x = prompt("Hello world");


async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("apiKey", (data) => {
            if (chrome.runtime.lastError || !data.apiKey) {
                const apiKey = prompt('Please enter your OpenAI API key:\nplatform.openai.com/account/api-keys');
                if (apiKey) {
                    chrome.storage.sync.set({ apiKey }, () => {
                        resolve(apiKey);
                    });
                } else {
                    resolve(null);
                }
            } else {
                resolve(data.apiKey);
            }
        });
    });
}

async function getSummary(url, apiKey) {
    const prompt = `Generate a 5 sentences  summary with important words emphasized with the html b tag for the website: "${url}" and return it as a JSON array  with each sentence as one entry. The key should be "points"`;
    
    // return [prompt];

    const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",  // "gpt-3.5-turbo", // "text-davinci-003",
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.2,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 1
        })
    });


    if (!response.ok) {
        alert(`API call failed with status: ${response.status}`);
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseObj = await response.json();
    const firstText = responseObj.choices[0].text;

    let result = JSON.parse(firstText);

    return result.points;
}

(async function () {
    const tab = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            resolve(tab);
        });
    });

    const apiKey = await getApiKey();

    if (!apiKey) {
        alert("No API key provided. Please restart the extension and enter a valid API key.");
        return;
    }

    try {

        const summary = await getSummary(tab.url, apiKey);


        const summaryElement = document.getElementById("summary");
        summaryElement.innerHTML = "<ol><li>" + summary.join("</li><li>") + "</li></ol>";
    } catch (error) {
        alert("Error: " + error.text);
    }
})();
