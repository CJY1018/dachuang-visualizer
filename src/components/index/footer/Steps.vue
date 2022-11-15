<template>
  <el-steps :active="active" align-center process-status="process" class="steps">
    <el-step title="分析数据" @click.native="active=Math.min(0,process)"></el-step>
    <el-step title="生成mask" @click.native="active=Math.min(1,process)"></el-step>
    <el-step title="生成增强数据" @click.native="active=Math.min(2,process)"></el-step>
    <el-step title="训练数据" @click.native="active=Math.min(3,process)"></el-step>
  </el-steps>
</template>

<script>
export default {
  name: "Steps",

  data() {
    return {
      "active": 0,
      "process": 2
    }
  },

  methods: {}
}
</script>

<style scoped>
.steps {
  position: relative;
  margin-top: 11px;
  width: 80%;
  left: 10%;
}
</style>