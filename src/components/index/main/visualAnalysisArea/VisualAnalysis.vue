<template>
  <div id="visual-analysis">
    <div id="visual-analysis-title">
      D. 直方图分析区
    </div>
    <div id="visual-analysis-body">
      <div id="visual-analysis-main">
      </div>
      <el-button id="visual-analysis-button"
                 type="plain"
                 size="medium"
                 @click="analyse"
                 v-show="oodScoreList.length"
                 ref="analyse"
                 :disabled="selection">
        分 析
      </el-button>
    </div>
  </div>
</template>

<script>
//引入echarts库
import * as echarts from 'echarts';

export default {
  name: "VisualAnalysis",

  data() {
    return {
      oodScoreList: [],
      minOod: 0,
      maxOod: 0,
      groupNum: 5,
      selectedGroup: [],
      selection: false,
    }
  },

  methods: {
    paint() {
      // 定义分组的宽度
      let groupWidth = (this.maxOod - this.minOod) / this.groupNum;
      // 定义分组区间
      let groupInterval = [];
      // 统计每个分组的数量
      let groupCount = [];
      this.selectedGroup = [];
      for (let i = 0; i < this.groupNum; i++) {
        this.selectedGroup.push(false);
        groupInterval.push(i + 1);
        groupCount[i] = {
          value: 0,
          itemStyle: {
            color: '#5470c6'
          }
        };
      }
      for (let i = 0; i < this.oodScoreList.length; i++) {
        let index = Math.floor((this.oodScoreList[i] - this.minOod) / groupWidth);
        if (index >= this.groupNum) {
          index = this.groupNum - 1;
        }
        groupCount[index].value++;
      }

      let chartDom = document.getElementById('visual-analysis-main');
      if (this.visualAnalysisChart)
        this.visualAnalysisChart.dispose();
      let myChart = echarts.init(chartDom);
      let option;

      let minOod = this.minOod;
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        formatter: function (params) {
          let low = (minOod + (parseInt(params[0].name) - 1) * groupWidth).toFixed(5);
          let high = (minOod + parseInt(params[0].name) * groupWidth).toFixed(5);
          return '分组区间：[' + low + ', ' + high + ']<br/>数量：' + params[0].value;
        },
        grid: {
          top: 20,
          bottom: '3%',
          left: '3%',
          right: '3%',
          containLabel: true
        },
        xAxis: {
          data: groupInterval,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: groupCount,
            type: 'bar',
            barWidth: '99.3%',
          }
        ]
      };

      option && myChart.setOption(option);
      this.visualAnalysisChart = myChart;

      let _this = this;

      myChart.off('click');
      // 将点击的颜色变为红色
      myChart.on('click', function (params) {
        let index = params.dataIndex;
        let option = myChart.getOption();
        let color = option.series[0].data[index].itemStyle.color;
        if (color === '#5470c6') {
          option.series[0].data[index].itemStyle.color = '#c0504d';
          _this.selectedGroup[index] = true;
        } else {
          option.series[0].data[index].itemStyle.color = '#5470c6';
          _this.selectedGroup[index] = false;
        }
        myChart.setOption(option);
      });
    },

    analyse() {
      this.$bus.$emit('sendAnalyse', this.selectedGroup);
    }
  },

  mounted() {
    this.$bus.$on('sendOodScoreList', (oodScoreList, minOod, maxOod) => {
      this.oodScoreList = oodScoreList;
      this.minOod = minOod;
      this.maxOod = maxOod;
      this.paint();
    });
    this.$bus.$on('sendHistogramGroupNum', (groupNum) => {
      this.groupNum = groupNum;
      this.paint();
    });
    this.$bus.$on('sendProjectionMethod', (switchSelectedFunc, groupNum) => {
      this.groupNum = groupNum;
    });
    this.$bus.$on('sendOodScoreToColor', (selection) => {
      this.selection = selection === 'true';
    });
  }
}
</script>

<style scoped>
#visual-analysis {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 8%, #FFFFFF 30px);
  text-align: left;
  width: 340px;
  height: 344px;
  margin-bottom: 20px;
}

#visual-analysis-title {
  text-align: center;
  font: bold 20px "HarmonyOS_Sans_SC_Black";
  -webkit-font-smoothing:antialiased;
  color: #FFFFFF;
}

#visual-analysis-body {
  text-align: left;
  font: 16px/30px "Microsoft YaHei";
  padding: 10px;
  width: 100%;
  height: 300px;
}

#visual-analysis-main {
  width: 320px;
  height: 270px;
}

#visual-analysis-button {
  float: right;
  margin-right: 20px;
}
</style>