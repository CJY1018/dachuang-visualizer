<template>
  <el-menu :class="this.header" default-active="1" mode="horizontal" background-color="#FFF" ref="header">
    <img src="static/userImg/Vue.png" alt="null" class="header-logo"/>
    <el-menu-item index="1">首页</el-menu-item>
    <el-menu-item index="2">使用说明</el-menu-item>
    <el-menu-item index="3">联系我们</el-menu-item>
    <el-menu-item index="4" class="header-user">消息中心</el-menu-item>
    <el-menu-item index="5" class="header-user">历史记录</el-menu-item>
    <el-submenu index="6" class="header-user">
      <template slot="title">我的工作台</template>
      <el-menu-item index="6-1">选项1</el-menu-item>
      <el-menu-item index="6-2">选项2</el-menu-item>
      <el-menu-item index="6-3">选项3</el-menu-item>
      <el-submenu index="6-4">
        <template slot="title">选项4</template>
        <el-menu-item index="6-4-1">选项1</el-menu-item>
        <el-menu-item index="6-4-2">选项2</el-menu-item>
        <el-menu-item index="6-4-3">选项3</el-menu-item>
      </el-submenu>
    </el-submenu>
    <el-menu-item index="7" class="header-user">个人中心</el-menu-item>
    <el-avatar src="static/userImg/hfut.jpg" class="header-user-avatar" fit="fill"></el-avatar>
  </el-menu>
</template>

<script>
export default {
  name: "PageHeader",
  data() {
    return {
      header: "header",
    }
  },
  mounted() {
    /* 鼠标下拉距离为20px时 ,position设置为fixed*/
    window.onscroll = function () {
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > 100) {
        this.header = "header-fixed";
      } else {
        this.header = "header";
      }
    }.bind(this);
  },
}
</script>

<style scoped>
.header {
  width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}


.header-logo {
  width: 50px;
  margin: 10px 20px 0 20px;
  float: left;
}

.header-user {
  float: right;
  margin-right: 20px;
}

.header-user-avatar {
  float: right;
  margin: 10px 20px 0 20px;
}
</style>