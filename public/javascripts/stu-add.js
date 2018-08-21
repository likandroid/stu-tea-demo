$('#btnSave').click(function (event) {
    event.preventDefault();
    var sno = $.trim($('#sno').val());
    var name = $.trim($('#name').val());
    var sex = $.trim($('#sex').val());
    var birthday = $.trim($('#birthday').val());
    var card = $.trim($('#card').val());
    var majorId = $.trim($('#majorId').val()) - 0;
    var classId = $.trim($('#classId').val()) - 0;
    var departId = $.trim($('#departId').val()) - 0;

    if (!sno || !name || !sex || !birthday || !card || majorId == -1 || majorId == -1 || departId == -1) {
        $('#myModal .modal-body').text('学号,姓名,性别,生日,身份证,所学专业，所属班级，所属院系不能为空！');
        $('#myModal').modal();
        return;
    }

    var nativePlace = $.trim($('#nativePlace').val());
    var address = $.trim($('#address').val());
    var qq = $.trim($('#qq').val());
    var phone = $.trim($('#phone').val());
    var email = $.trim($('#email').val());
    // 身份证格式和邮箱格式验证
      // sex: $('#sex').val(),  就可以省略
    var data = { 
        sno, name, sex, birthday, card, majorId, classId, departId, nativePlace,
        address, qq, phone, email
    }
  
    $.post('/students/add', data, function (d) {
        // console.log(data);
        // console.log(d);
        if (d.code != 200) {
            $('#myModal .modal-body').text(d.message);
            $('#myModal').modal();
            return;
        }
        console.log("进入");
        location.href = '/students/list';
    })

})