const socket = io()

const clientsTotal = document.getElementById('clients-total')

const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');


const messageTone = new Audio('/msg_tone.mp3') //tone which alarms while receiving the message

// kyuki .html mein submit pe click karne par form submit hota hai joki , uss form k 'ID' se address karenge.
messageForm.addEventListener('submit' , (e)=>{
    e.preventDefault();
    sendMessage();//this function will be called whenever someone clicks the form ,[clicking the form means send the message here]
})

// the event that is emitted from server to client is handled on the client side since "main.js" is connected on the client side
// event name i.e -> clients-total server se bhej rhe hai toh receeive karte smaay bhi same to same name hoga
socket.on('clients-total' , (data)=>{
    console.log(data);
    clientsTotal.innerText = `Total clients : ${data}`
})


// 1) sender sending the message

function sendMessage(){   //jaisi hi yeh function call hoga woh message-input wlae id ki value display karega 
    
    if(messageInput.value === ''){
        return;
    }
    
    console.log(messageInput.value);

    //creating a JSON object , becz we have to send this to the server
    const data = {
        name : nameInput.value,
        message : messageInput.value,
        dateTime : new Date()
    }

    //now sending the message

    // ass we know the message will be send from the ---> Client to the server <--- therefor we will use the [socket.function_] 
    // aur kyuki we are sending it ---------------------> therefore we will use ---->.emit()  <-------

    // 'message' is the event name and it can be anything , and [data] is the info or message that we are sending 
    socket.emit('message' , data)

    addMesageToUi(true , data) // yaha --- true --- isliye kiye hai kyuki yeh message client side se bhej ja rha hai

    // message bhej dene k baad input fields ko empty kar do
    messageInput.value = ""
}


// 3) Now , the message is received by  the server and then broadcasted to all other connected users. //except the sender
// Receiving the message ---> for other clients
// ab kyuki sender aur recieevr ka code ek hi page mein hai toh jab sender message bhej rha haitab usko 
// chor k baki sabko jayega yeh messgae 

socket.on('chat-message' , (data) =>{
    messageTone.play()
    console.log(data);
    addMesageToUi(false , data) //false isliye kiye hai kyuki yeh message server se aa rha hai joki dusra koi user bhej rha hai 
})



// this functuion is for handling the chat UI , toh yeh functin do jagah se call hoga
// 1) jahan se message bhej rhe hai         2) jahan message ja rha hai

// Chat mein message do taref se aa rha hai , ek khud ka hai ek dusre users ka
function addMesageToUi(isOwnMessage , data){

    clearFeedback();

    // agar khud ka message hai toh right ki taraf dikhao aur agar dusre ka messgae hai toh left ki taraf dikhao
    const element = `
            <li class="${isOwnMessage ? "message-right" : "message-left" }"> 
                <p class="message">
                    ${data.message}
                    <span>${data.name} ⏳ ${moment(data.dateTime).fromNow()}</span>
                </p>
            </li>
            `

    // adding the above update elemnt in message-container.

    messageContainer.innerHTML += element;
    scrollToBotton();
}

// function that automatically scrolls to bottom after sending the message
// iss function ki bina hum jab bhi message ko send karte hai tab woh hame scroll karna padte hai uss message ko dekhne k liye

function scrollToBotton(){
    messageContainer.scrollTo( 0 , messageContainer.scrollHeight)
}


// abb jab bhi koi user ---> client field pe {focus , keypress , blur} jaisa event perform karega tab yeh messageInput ka event call hoga ,
// Isase yeh pta chalega ki kon typing kar rha hai

messageInput.addEventListener('focus' , (e) =>{
    socket.emit('feedback' , {
        feedback : `${nameInput.value} is typing a message`
    })
})


messageInput.addEventListener('keypress' , (e) =>{
    socket.emit('feedback' , {
        feedback : `${nameInput.value} is typing a message`
    })
})


messageInput.addEventListener('blur' , (e) =>{
    socket.emit('feedback' , {
        feedback : '',
    })
})

// upadting the typing field ----> agar bahut se clients baat kar rha hai tab alag alaf log type karenge toh usko update karte rahane hoga
socket.on('feedback' , (data)=>{

    clearFeedback();

    const element = `
            <li class="message-feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
            </li>`

    messageContainer.innerHTML += element
})


// yeh nhi karenge tog jo typing kar k ja chuka hai uska bhi naam dikhaega 

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element => {
        element.parentNode.removeChild(element)
    })
}