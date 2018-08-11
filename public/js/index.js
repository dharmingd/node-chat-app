function scrollToBottom(){
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if(clientHeight + scrollTop + scrollHeight + newMessageHeight + lastMessageHeight>=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}

var socket = io();
socket.on('connect', ()=>{
    console.log("Connected to server");

})
socket.on('disconnect', ()=>{
    console.log("Disconnected from server");
})

socket.on('newMessage', (message)=>{
    //console.log(message);
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var span1 = $('<span class="username"></span>');
    span1.text(message.from + " ");
    var span2 = $('<span class="time"></span>');
    span2.text(formattedTime + " : ");
    var span3 = $('<span class="textMsg"></span>');
    span3.text(message.text);
    li.append(span1);
    li.append(span2);
    li.append(span3);
    $('#messages').append(li);
    scrollToBottom();
})


socket.on("newLocationMessage", (message)=>{
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var li = $('<li></li>');
    var span1 = $('<span class="username"></span>');
    span1.text(message.from + " ");
    var span2 = $('<span class="time"></span>');
    span2.text(formattedTime + " : ");
    var span3 = $('<span class="textMsg"></span>');
    var a = $("<a target='_blank'>My current location</a>");
    a.attr('href', message.url);
    span3.append(a);
    li.append(span1);
    li.append(span2);
    li.append(span3);
    $('#messages').append(li);
    scrollToBottom()
})

$('#message-form').on('submit', function(e){
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'Dharmin',
        text: $('#messageText').val()
    }, function(){
        $('#messageText').val('');
        //console.log("Data Received");
    })
})

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if(!navigator.geolocation){
        return alert("Your browser does not support Geolocation");
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function(){
        locationButton.removeAttr('disabled').text('Send location');
        alert("Unable to fetch location");
    });
});