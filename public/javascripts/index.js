$(function () {
  /* $('#btnLogout').click(function(){
    $.post('/logout', function(data){
      console.log(data);
    })
  }) */
  $('#logout').on("click", function () {
    $.post('/logout', function(data){
      if (data.code != 200) {
        $('#myModal .modal-body').text('注销出现异常');
        $('#myModal').modal();
        return;
      }
      location.href = '/login';
    })
    
  })

/*   $('.list-group a').click(function(){
    $.cookie("activeLink",$(this).attr('href'));
  })
  var activeLink = $.cookie("activeLink");
  $('.list-group a').removeClass('active');
  if (activeLink) {
    $(`.list-group a[href = '${activeLink}']`).parent().addClass('active');
  }
  console.log( $.cookie("activeLink")); */
/*   var url = purl();
  console.log(url.data.attr.path);
  
  // 获取当前激活状态下的URL路径中的path属性，如/student/add
  var activeLink = purl().data.attr.path;
  // 先把所有的带有类名为.list-group的元素下的a标签的类移除active
$('.list-group a').parent().removeClass('active');
// 再把当前激活的URL所对应的a标签的父元素
$(`.list-group a[href='${activeLink}']`).parent().addClass('active');

$('panel-title a').attr('aria-expanded',false);
$('.panel-collapse').removeClass('in');
$(`.list-group a[href='${activeLink}']`).closest('.panel-default').find('panel-title a').attr('aria-expanded',true);
})
$(`.list-group a[href='${activeLink}']`).closest('.panel-collapse').addClass('in'); */



// 获取当前激活状态下的URL路径中的path属性，如: /students/add
var activeLink = purl().data.attr.path;
// 查询所有的带有类名为.list-group的元素下的a标签所对应的父元素li。把它的样式类active移除。
$('.list-group a').parent().removeClass('active');
// 再把当前激活的URL所对应的a标签的父元素li添加一个样式类active
$(`.list-group a[href='${activeLink}']`).parent().addClass('active');

$('.panel-title a').attr('aria-expanded', false);
$('.panel-collapse').removeClass('in');

if($(`.list-group a[href='${activeLink}']`).length == 0){
  // 找不到路径时，让学生管理默认展开显示
  $('.panel-title:first a').attr('aria-expanded', true);
  $('.panel-collapse:first').addClass('in');
}else{
  $(`.list-group a[href='${activeLink}']`).closest('.panel-default').find('.panel-title a').attr('aria-expanded', true);
  $(`.list-group a[href='${activeLink}']`).closest('.panel-collapse').addClass('in');
}

})