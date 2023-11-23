const submitButton = document.querySelector('#submit-theme')
const outPutElement = document.querySelector('.output-container')
const inputElement=document.querySelector('input#prompt')
const bottomSection=document.querySelector('.bottom-section')
const imagegenButton=document.querySelector('#image-gen')
const storygenButton=document.querySelector('#submit-title')
const titleInput=document.querySelector('#title')
const targetLanguage=document.getElementById('language')
const first_input_container=document.getElementById('first-input-container')
const first_spinner=document.getElementById('first-spinner')
const second_spinner=document.getElementById('second-spinner')
const third_spinner=document.getElementById('third-spinner')
const create_btn_msg=document.getElementById('create-btn-msg')

window.onload = () => { 
    if (!localStorage.getItem("access")) {
        alert("잘못된 접근입니다.")
        window.location.href = `${frontend_base_url}/index.html`
    }
}
function changeInput(value){
    const inputElement=document.querySelector('input#prompt')
    inputElement.value=value
}
async function getMessage(){
    console.log('clicked')
    const access_token = localStorage.getItem("access");
    const options={
        method:'POST',
        headers:{
            'Authorization':`Bearer ${access_token}`,
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            subject : inputElement.value,
            target_language : targetLanguage.value
        })
    }
    try{
        first_spinner.style.display="block"
        const response = await fetch(`${backend_base_url}/story/fairytail_gpt/`,options)
        const data = await response.json()
        console.log(data)
        const error=data.error_message
        if(error=='toxcity_detected'){
            window.alert(data.message)
            window.location.reload();
        }else{
            window.alert(data.message)
            const defaultMessage=document.getElementById('information')
            defaultMessage.style.display="none"

            let original = data.original.replace(/\n/g, "<br>");
            const originalText=document.createElement("div")
            originalText.setAttribute("class","original-script-box")
            originalText.setAttribute("id","original-script")
            originalText.innerHTML = original
            outPutElement.appendChild(originalText)

            let translation = data.translation.replace(/\n/g, "<br>");
            const translatedText=document.createElement("div")
            translatedText.setAttribute("class","translated-script-box")
            translatedText.setAttribute("id","translated-script")
            translatedText.innerHTML = translation
            outPutElement.appendChild(translatedText)

            first_spinner.style.display="none"
            imagegenButton.style.display="block"
            first_input_container.style.display="none"
            outPutElement.style.display="block"
            
            if (data.translation&&inputElement.value){
                const pElement=document.createElement('p')
                pElement.textContent=inputElement.value
                pElement.addEventListener('click',()=>changeInput(pElement.textContent))
            }
        }
    }catch (error){
        console.error(error)
    }
}

function clearInput(){
    inputElement.value=''
}
submitButton.addEventListener('click',getMessage)

async function getImage(){
    console.log('image generated...')
    second_spinner.style.display="block"
    const original_script=document.querySelector("#original-script")
    const translated_script=document.querySelector("#translated-script")
    const access_token = localStorage.getItem("access");
    const options={
        method:'POST',
        headers:{
            'Authorization':`Bearer ${access_token}`,
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            original_script : original_script.innerHTML,
            translated_script : translated_script.innerHTML,
        })
    }
    try {
        const response = await fetch(`${backend_base_url}/story/image_dall-e/`, options);
        const res_json = await response.json();
        const results=res_json.results
        console.log(results);
        const pagebox=document.createElement("div")
        pagebox.setAttribute("class","page-box")
        outPutElement.appendChild(pagebox)
        if (Array.isArray(results)) {
            results.forEach(result => {
                const newPage = document.createElement("div");
                newPage.setAttribute("class", "page");

                const newHr = document.createElement("hr");
                newHr.setAttribute("class", "hr-of-paragraph");
    
                const newImageBox = document.createElement("div");
                newImageBox.setAttribute("class", "image-of-paragraph");
    
                const newTextBox = document.createElement("div");
                newTextBox.setAttribute("class", "text-of-paragraph");
                
                newPage.appendChild(newHr);
                newPage.appendChild(newImageBox);
                newPage.appendChild(newTextBox);
    
                const newImage = document.createElement("img");
                newImage.setAttribute("src", result.image_url);
                newImageBox.appendChild(newImage);
    
                const newText = document.createElement("p");
                newText.innerText = result.text;
                newTextBox.appendChild(newText);

                pagebox.appendChild(newPage)
            });
            second_spinner.style.display="none"
            titleInput.style.display="block"
            storygenButton.style.display="block"
            create_btn_msg.style.display="block"
        } else {
            console.log('results is not an array');
        }
    }
    catch(error){
        console.error(error)
    }
}
imagegenButton.addEventListener('click',getImage)

async function createStory(){
    console.log("You are going to make a fairytale...")
    const pages=document.querySelectorAll('.page-box .page')
    let paragraph_list=[]
    let image_url_list=[]
    pages.forEach(page=>{
        const imageBox=page.querySelector('.image-of-paragraph img')
        image_url_list.push(imageBox.src)
        const textBox=page.querySelector('.text-of-paragraph p')
        paragraph_list.push(textBox.innerText)
    })
    const access_token = localStorage.getItem("access");
    const options={
        method:'POST',
        headers:{
            'Authorization':`Bearer ${access_token}`,
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            paragraph_list : paragraph_list,
            image_url_list : image_url_list,
            title : titleInput.value
        })
    }
    try {
        const response = await fetch(`${backend_base_url}/story/`, options);
        const res_json = await response.json();
        const id=res_json.story_id
        if(res_json.status==201){
            console.log(id)
            window.alert(res_json.success)
            window.location.href = `${frontend_base_url}/story/detail.html?story_id=${id}`;

        }
        else{
            window.alert(res_json.error)
            window.location.reload(`${frontend_base_url}`);
        }
    }
    catch(error){
        console.error(error)
    }

}
storygenButton.addEventListener('click',createStory)