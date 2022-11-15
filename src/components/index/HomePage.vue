<template>
  <el-container>
    <!--  顶栏  -->
    <el-header height="10%" style="padding: 0">
      <PageHeader class="header"></PageHeader>
    </el-header>
    <!--  主体  -->
    <el-main>
      <PageMain/>
    </el-main>
    <!--    &lt;!&ndash;  底栏  &ndash;&gt;-->
    <!--    <el-footer height="15%">-->
    <!--      <Steps></Steps>-->
    <!--    </el-footer>-->
    <el-backtop>
      <i class="el-icon-caret-top"></i>
    </el-backtop>
  </el-container>
</template>

<script>

import PageHeader from "@/components/index/header/PageHeader";
import PageMain from "@/components/index/main/PageMain";
import Steps from "@/components/index/footer/Steps";

export default {
  name: "Home",
  components: {
    PageHeader,
    PageMain,
    Steps,
  }
}
</script>

<style scoped>
.el-header el-footer {
  padding: 0;
}

.el-main {
  background-color: #f5f6f7;
  color: #333;
  text-align: center;
  /*height: 670px;*/
  /*height: 755px;*/
  height: 1600px;
  padding: 20px;
  overflow-y: hidden;
}

</style>