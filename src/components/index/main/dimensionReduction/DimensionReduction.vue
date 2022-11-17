<template>
  <div id="dim-red">
    <div id="dim-red-title">
      降维显示效果图
    </div>
    <div id="dim-red-body">
      <div id="main"></div>
    </div>
  </div>
</template>

<script>
//引入echarts库
import * as echarts from 'echarts';

export default {
  name: "DimensionReduction",

  data() {
    return {
      dataset: [],
      selectedFunc: false, // false: 查看，true: 删除
      selectedIndices1: [],
      selectedDelPointList: [],
      selectedPointList: [],
      minOod: 0,
      maxOod: 0,
      groupNum: 5,
    }
  },

  methods: {
    paint2(filePath) {
      // 读取数据
      d3.csv(filePath).then(dataset => {
        this.dataset = dataset;
        let ood = [];
        let maxOod = this.dataset[0].ood_score, minOod = this.dataset[0].ood_score;
        for (let i = 0; i < this.dataset.length; i++) {
          if (!isNaN(this.dataset[i].ood_score)) {
            this.dataset[i].ood_score = parseFloat(this.dataset[i].ood_score);
            ood.push(this.dataset[i].ood_score);
            //找到最大最小值
            if (this.dataset[i].ood_score > maxOod) {
              maxOod = this.dataset[i].ood_score;
            } else if (this.dataset[i].ood_score < minOod) {
              minOod = this.dataset[i].ood_score;
            }
          }
        }
        this.minOod = minOod;
        this.maxOod = maxOod;

        // 发送ood_score区间
        this.$bus.$emit('sendOodScoreRange', minOod, maxOod);
        // 发送ood_score
        this.$bus.$emit('sendOodScoreList', ood, minOod, maxOod);

        let chartDom = document.getElementById('main');
        let myChart = echarts.init(chartDom);
        let option;

        option = {
          title: {
            text: 'Old points and new points distribution',
          },
          grid: {
            left: '3%',
            right: '7%',
            bottom: '7%',
            containLabel: true
          },
          tooltip: {
            // trigger: 'axis',
            showDelay: 0,
            formatter: function (params) {
              if (params.value.length > 1) {
                return (
                    params.seriesName +
                    ' :<br/>' +
                    params.value[0] +
                    'px ' +
                    params.value[1] +
                    'px '
                );
              } else {
                return (
                    params.seriesName +
                    ' :<br/>' +
                    params.name +
                    ' : ' +
                    params.value +
                    'px '
                );
              }
            },
          },
          toolbox: {
            feature: {
              dataZoom: {},
              brush: {
                type: ['rect', 'polygon', 'clear']
              }
            }
          },
          brush: {
            throttleType: 'debounce',
            throttleDelay: 300,
          },
          legend: {
            title: 'Legend',
            data: ['0', '1', '2'],
            left: 'center',
            bottom: 10
          },
          xAxis: [
            {
              type: 'value',
              scale: true,
              axisLabel: {
                formatter: '{value} px'
              },
              splitLine: {
                show: true
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              scale: true,
              axisLabel: {
                formatter: '{value} px'
              },
              splitLine: {
                show: true
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              name: '0',
              type: 'scatter',
              symbolSize: 6,
              // prettier-ignore
              data: this.dataset.map(function (item) {
                if (item.label === '0')
                  return [item.x, item.y, item.ood_score];
              }),
            },
            {
              name: '1',
              type: 'scatter',
              symbolSize: 6,
              // prettier-ignore
              data: this.dataset.map(function (item) {
                if (item.label === '1')
                  return [item.x, item.y, item.ood_score];
              }),
            },
            {
              name: '2',
              type: 'scatter',
              symbolSize: 6,
              // prettier-ignore
              data: this.dataset.map(function (item) {
                if (item.label === '2') {
                  return [item.x, item.y, null];
                }
              }),
            },
          ]
        };

        option.animationThreshold = 8000;
        option && myChart.setOption(option);
        this.option = option;
        this.dimensionReductionChart = myChart;

        let bus = this.$bus;

        function renderBrushed(params) {
          if (params.batch[0].selected[1]) {
            // 输出被选中点的下标
            let selectedIndices1 = params.batch[0].selected[1].dataIndex;
            let length = selectedIndices1.length

            bus.$emit('sendPointsLength', length); // 发送被选中的点的数量
            let selectedPoints = [];
            for (let i = 0; i < length; i++) {
              selectedPoints.push(_this.dataset[selectedIndices1[i]]);
            }
            _this.selectedIndices1 = selectedIndices1;
            _this.selectedPointList = selectedPoints;
          }
        }

        let _this = this;

        //  输出选中的点
        myChart.on('brushSelected', renderBrushed);
        // 点击点时
        myChart.on('click', function (params) {
          if (_this.selectedFunc === false) { //查看
            _this.selectedPointList = [_this.dataset[params.dataIndex]];
            _this.$bus.$emit('sendSelectedPoint', _this.dataset[params.dataIndex]);
          } else if (params.seriesName === '1') { //删除
            _this.selectedDelPointList.push({
              index: params.dataIndex,
              data: _this.dataset[params.dataIndex],
              type: parseInt(params.seriesName)
            })
            _this.dataset[params.dataIndex] = null;
            option.series[params.seriesIndex].data[params.dataIndex] = null;
            myChart.setOption(option);
          }
        });
      });
    },
    deletePoints() {
      if (this.selectedIndices1.length > 0) {
        let myChart = this.dimensionReductionChart;
        let option = this.option;
        let selectedDelPointList = this.selectedDelPointList;
        let dataset = this.dataset;
        this.selectedIndices1.forEach(function (item) {
          selectedDelPointList.push({
            index: item,
            data: dataset[item],
            type: 1
          })
          dataset[item] = null;
          option.series[1].data[item] = null;
        });
        myChart.setOption(option);
        this.selectedIndices1 = [];
        this.selectedPointList = [];
        this.$bus.$emit('sendPointsLength', 0);
      } else {
        alert("请先选择要删除的点");
      }
    },
    withdraw() {
      if (this.selectedDelPointList.length <= 0) {
        alert("已经没有删除的点可以撤回了哟~")
        return;
      }
      /*let myChart = echarts.init(this.chartDom);
      let option = this.option;*/
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      let tail = this.selectedDelPointList.pop();
      let index = tail.index
      let type = tail.type
      let data = tail.data;
      option.series[type].data[index] = [data.x, data.y, data.ood_score]
      this.dataset[index] = data;
      option.animation = false;
      myChart.setOption(option);
      option.animation = true;
      myChart.setOption(option);
    },
    withdraw10() {
      if (this.selectedDelPointList.length <= 0) {
        alert("已经没有删除的点可以撤回了哟~")
        return;
      }
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      let length = this.selectedDelPointList.length;
      for (let i = 0; i < Math.min(length, 10); i++) {
        let tail = this.selectedDelPointList.pop();
        let index = tail.index
        let type = tail.type
        let data = tail.data;
        option.series[type].data[index] = [data.x, data.y, data.ood_score]
        this.dataset[index] = data
      }
      option.animation = false;
      myChart.setOption(option);
      option.animation = true;
      myChart.setOption(option);
    },
    analyse(selectedGroup) {
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      // 定义分组的宽度
      let groupWidth = (this.maxOod - this.minOod) / selectedGroup.length;
      for (let j = 0; j < this.dataset.length; j++) {
        if (this.dataset[j] && this.dataset[j].label === '1') {
          let index = Math.floor((this.dataset[j].ood_score - this.minOod) / groupWidth);
          if (index >= selectedGroup.length) {
            index = this.groupNum - 1;
          }
          if (selectedGroup[index]) {
            option.series[1].data[j] = {
              value: [this.dataset[j].x, this.dataset[j].y, this.dataset[j].ood_score],
              itemStyle: {
                color: '#ee6666'
              }
            };
          } else {
            option.series[1].data[j] = [this.dataset[j].x, this.dataset[j].y, this.dataset[j].ood_score];
          }
        }
      }
      myChart.setOption(option);
    },
    reset() {
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      for (let j = 0; j < this.dataset.length; j++) {
        if (this.dataset[j] && this.dataset[j].label === '1') {
          option.series[1].data[j] = [this.dataset[j].x, this.dataset[j].y, this.dataset[j].ood_score]
        }
      }
      myChart.setOption(option);
    },
    exportPickedData() {
      this.$nextTick(() => {
        if (this.selectedPointList.length > 0)
          this.$bus.$emit('sentSelectedPointList', this.selectedPointList);
        else
          alert("请先选择要导出的点");
      })
    },
    oodScoreToColor(selection) {
      if (this.dimensionReductionChart._chartsViews) {
        let myChart = this.dimensionReductionChart;
        let option = this.option;
        if (selection === 'true') {
          option.visualMap = {
            min: this.minOod,
            max: this.maxOod,
            range: [this.minOod, this.maxOod],
            dimension: 2,
            orient: 'vertical',
            precision: 4,
            right: 10,
            top: 'center',
            text: ['HIGH', 'LOW'],
            calculable: true,
            realtime: false,
            inRange: {
              color: ['#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026']
            }
          };
          delete option.series[2]
          option.series[0].data = this.dataset.map(function (item) {
            if (item && !isNaN(item.ood_score) && item.label === '0') {
              return [item.x, item.y, item.ood_score]
            } else
              return [null, null, 0]
          })
          option.series[1].data = this.dataset.map(function (item) {
            if (item && !isNaN(item.ood_score) && item.label === '1') {
              return [item.x, item.y, item.ood_score]
            } else
              return [null, null, 0]
          })
          option.legend = {
            title: 'Legend',
            data: ['0', '1'],
            left: 'center',
            bottom: 10
          }
        } else {
          delete option.visualMap;
          option.series[2] = {
            name: '2',
            type: 'scatter',
            symbolSize: 6,
            emphasis: {
              focus: 'series'
            },
            // prettier-ignore
            data: this.dataset.map(function (item) {
              if (item && item.label === '2') {
                return [item.x, item.y];
              }
            }),
          }
          option.legend = {
            title: 'Legend',
            data: ['0', '1', '2'],
            left: 'center',
            bottom: 10
          }
        }
        myChart.clear()
        myChart.setOption(option);
      }
    }
  },
  mounted() {
    this.$bus.$on('sendProjectionMethod', (projectionMethod) => {
      if (this.dimensionReductionChart) {
        this.dimensionReductionChart.dispose()
        this.selectedDelPointList = [];
        this.selectedPointList = [];
      }
      if (projectionMethod === '无') {
      } else if (projectionMethod === 'T-SNE算法') {
        this.paint2('static/牛逼d.csv')
      } else if (projectionMethod === '训练后T-SNE算法') {
        this.paint2('static/data训练后TSNE.csv')
      } else if (projectionMethod === 'PCA算法') {
        this.paint2('static/pca牛逼d.csv')
      } else if (projectionMethod === '训练后PCA算法') {
        this.paint2('static/data训练后PCA.csv')
      }
    })
    // 切换查找/删除功能
    this.$bus.$on('sendSwitchSelectedFunc', (switchSelectedFunc) => {
      this.selectedFunc = switchSelectedFunc;
    });
    // 删除选中
    this.$bus.$on('deleteSelectedPoints', this.deletePoints);
    // 撤回
    this.$bus.$on('sendWithdraw', this.withdraw);
    // 撤回10个
    this.$bus.$on('sendWithdraw10', this.withdraw10);
    // 分析
    this.$bus.$on('sendAnalyse', this.analyse);
    // 重置
    this.$bus.$on('sendHistogramGroupNum', this.reset);
    // 导出数据
    this.$bus.$on('exportPickedData', this.exportPickedData);
    // ood分数颜色
    this.$bus.$on('sendOodScoreToColor', this.oodScoreToColor);
  },
}
</script>

<style scoped>
#dim-red {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 4%, #FFFFFF 30px);
  height: 706px;
  margin-right: 20px;
  width: 97%;
}

#dim-red-title {
  text-align: center;
  font: bold 20px "Microsoft YaHei";
  color: #FFFFFF;
}

#dim-red-body {
  text-align: left;
  font: 16px/30px "Microsoft YaHei";
  padding: 10px;
}

#main {
  height: 650px;
}
</style>