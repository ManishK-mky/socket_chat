const express = require('express');
const app = express();
const PORT = 3300;
const path = require('path')
const http = require('http');
const server = http.createServer(app); // Create an HTTP server using Express

const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname , 'public')));


// Define routes
app.get('/', function(req, res) {
    res.send("<h1>Hello world</h1>");
});

//------------------------Itna karne jab bhi koi user '/chat route pe jayega toh woh as a new user jayega'-------------------------- 

app.get('/chat' , function(req,res){
    res.sendFile('chat.html' , {root : path.join(__dirname , 'public')})
})

// creating a set which is used to contains the number of unique users on this given set
let socketsConnected = new Set();

//connecting  socket to the server and getting the connected user

// --------------------------------------
// -- emit() --> means bhejna () --> [agar io.emit() -> likha ho toh server se client ko bjhna &&&& agar socket.emit() --> likha ho toh CLIENT se SERVER ko bhjna]   --
// -- on()  --> means receive karna  -->> 
// ---------------------------------------

// In Socket.IO, the io.on('connection', ...) function is used to handle events.
// related to new client connections to the server. 
// The 'connection' event is a built-in event in Socket.IO that is triggered whenever a new client connects to the server.
io.on('connection', onConnected);

function onConnected(socket){
    console.log(socket.id + " connected!");
    socketsConnected.add(socket.id)

    // In Socket.IO, the .emit() function is used to send custom events from the server to the client or from the client to the server. It allows you to transmit data along with an event name to the receiving end, 
    
        //    ----- FROM SERVER TO CLIENT ----(from Server to the all connected clients)
    // this will Emit a custom event named 'clients-total' to all connected clients
    io.emit('clients-total' , socketsConnected.size)

    // io.function_name() --> deals with SERVER side
    // socket.function_name() --> deals with CLIENT side(from client to the server) matlab agar koii user disconnetc hoga toh woh phle client side se jayega aur info. server tak pahuchegi tab woh backend se bhi disconnect hoga 

    // Listen for the 'disconnect' event from the server
    // "disconnect" is another built-in event in Socket.IO, just like "connection". It's triggered when a client disconnects from the server.
    socket.on("disconnect", ()=>{
        console.log('Socket disconnected' , socket.id);
        socketsConnected.delete(socket.id);
        io.emit('clients-total' , socketsConnected.size)
    })


    // 2) Receiving the message from sender and sending the message to all the clients that are connected except the sender using {socket.broadcast.emit()}
    // we are receiving the meaage coming form the CLIENT
    socket.on("message", (data) =>{
        console.log(data);

        // socket.broadcast.emit() --> sends data to everyone except the sender
        // socket.to().emit()            --> send only to that particular socket whose id matches the one provided in .to()
        socket.broadcast.emit('chat-message' , data)
    })


    // for ---> feedback <--- event

    socket.on( "feedback" , (data)=>{
        socket.broadcast.emit('feedback' , data)
    })

}

// -------------------------------------------------------

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
