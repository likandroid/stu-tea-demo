$('#btnSave').click(function(event){
    event.preventDefault();
    var data = {
        sno: $('#sno').val(),
        name: $('#name').val(),
        sex: $('#sex').val(),
        birthday: $('#birthday').val(),
        card: $('#card').val(),
        majorId: 1,
        classId: 1,
        departId: 1,
        nativePlace: $('#nativePlace').val(),
        address: $('#address').val(),
        qq: $('#qq').val(),
        phone: $('#phone').val(),
        email: $('#email').val()
        }
    console.log("进入");
    $.post('/students/add', data, function(d){
        console.log(data);
        console.log(d);
    });
    
})