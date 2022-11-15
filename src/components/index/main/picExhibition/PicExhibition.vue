<template>
  <div id="pic-exhibition">
    <div id="pic-exhibition-title">
      数据图片展示区
    </div>
    <div id="pic-exhibition-body">
      <el-image
          v-if="picName"
          style="width: 256px; height: 256px"
          :src="src"
          :preview-src-list="srcList"
          icon="el-icon-picture-outline">
        <div slot="placeholder" class="image-slot">
          加载中<span class="dot">...</span>
        </div>
      </el-image>
      <br/>
      <span>{{ picName }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PicExhibition",

  data() {
    return {
      src: null,
      srcList: [],
      picName: null,
    }
  },

  methods: {},

  mounted() {
    this.$bus.$on("sendSelectedPoint", (point) => {
      if (point.pic_name === null) {
        this.src = null;
        this.srcList = [];
        this.picName = null;
      } else {
        this.src = "static/qp/" + point.pic_name
        this.srcList = [this.src]
        this.picName = point.pic_name
      }
    })
  }
}
</script>

<style scoped>
#pic-exhibition {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 8%, #FFFFFF 30px);
  text-align: left;
  width: 340px;
  height: 336px;
  margin-bottom: 20px;
}

#pic-exhibition-title {
  text-align: center;
  font: bold 20px "Microsoft YaHei";
  color: #FFFFFF;
}

#pic-exhibition-body {
  font: 16px/30px "Microsoft YaHei";
  padding: 10px;
  text-align: center;
}

</style>