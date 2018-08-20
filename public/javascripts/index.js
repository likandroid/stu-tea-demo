$(function () {
    /* $('#btnLoginout').click(function(){
      $.post('/logout', function(data){
        console.log(data);
      })
    }) */
    $('#btnLoginout').on("click", function () {
      location.href = '/login';
    })

  })
  // 客户端渲染，要响应res.json(....),在这里就要发起ajax请求
        