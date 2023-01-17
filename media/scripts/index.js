console.log('Hello Gridea')

<script type="application/javascript">

AOS.init();

var app = new Vue({
  el: '#app',
  data: {
    menuVisible: false,
  },
})

// 文章内A标签全部改为"在新窗口中打开"
document.querySelectorAll('.post-content a[href^="http"]').forEach(el => el.setAttribute('target', '_blank'));
</script>