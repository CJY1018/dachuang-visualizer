<template>
  <div id="basic-info">
    <div id="basic-info-title">
      基本信息
    </div>
    <div id="basic-info-body">
      图片名：{{ imgName }}<br/>
      类别：{{ imgType }}<br/>
      ood得分：{{ oodScore }}<br/>
      ood得分区间：{{ oodScoreRange }}<br/>
      投影方式：{{ projectionMethod }}<br/>
      已选中数据的个数：{{ selectedDataNum }}<br/>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageMain",

  data() {
    return {
      imgName: "Nan",
      imgType: "Nan",
      oodScore: 'Nan',
      oodScoreRange: "[]",
      projectionMethod: "PCA",
      selectedDataNum: 0,
    };
  },

  methods: {},

  mounted() {
    // 接收ood得分区间
    this.$bus.$on('sendOodScoreRange', (minOdd, maxOdd) => {
      this.oodScoreRange = "[" + minOdd + "," + maxOdd + "]";
    });
    // 接收选中点的个数
    this.$bus.$on('sendPointsLength', (length) => {
      this.selectedDataNum = length;
    });
    // 接收选中的点
    this.$bus.$on('sendSelectedPoint', (point) => {
      this.imgName = point.pic_name;
      this.imgType = point.label;
      this.oodScore = point.ood_score;
      this.selectedDataNum = 1;
    });
  }
}
</script>

<style scoped>
#basic-info {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 12%, #FFFFFF 30px);
  text-align: left;
  width: 300px;
  height: 230px;
  margin-bottom: 20px;
  margin-right: 20px;
}

#basic-info-title {
  text-align: center;
  font: bold 20px "Microsoft YaHei";
  color: #FFFFFF;
}

#basic-info-body {
  text-align: left;
  font: 16px/30px "Microsoft YaHei";
  padding: 10px;
}

</style>