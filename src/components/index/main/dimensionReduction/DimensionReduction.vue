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
//引入d3库
import * as d3 from 'd3';
//引入echarts库
import * as echarts from 'echarts';

export default {
  name: "DimensionReduction",

  data() {
    return {
      dataset: [],
      allPoints: {},
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
    paint(filePath) {
      // 读取数据
      d3.csv(filePath).then(dataset => {
        // 保存数据集
        this.dataset = dataset;
        let ood = [];
        let maxOod = parseFloat(dataset[0].ood_score), minOod = parseFloat(dataset[0].ood_score);
        let points_0 = [], points_1 = [], points_2 = [];
        let allPoints = {};
        dataset.forEach((data) => {
          switch (data.label) {
            case "0":
              points_0.push(data);
              break;
            case "1":
              let ood_score = parseFloat(data.ood_score);
              points_1.push(data);
              ood.push(ood_score);
              minOod = Math.min(minOod, ood_score);
              maxOod = Math.max(maxOod, ood_score);
              break;
            case "2":
              points_2.push(data);
              break;
          }
        })
        // 保存最大最小值
        this.minOod = minOod;
        this.maxOod = maxOod;
        // 保存全部点
        this.allPoints = allPoints = {
          0: points_0,
          1: points_1,
          2: points_2,
        }

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
              dataView: {
                readOnly: true,
                optionToContent: function (param) {
                  let series = param.series;
                  let table = '<table id="testtable" ' +
                      'style="width:100%;text-align:center;' +
                      'border-collapse: collapse;' +
                      'margin-bottom: 20px" border="1">' +
                      '<thead><tr>'
                      + '<th>id</th>'
                      + '<th>label</label></th>'
                      + '<th>x</th>'
                      + '<th>y</th>'
                      + '<th>ood_score</th>'
                      + '</tr></thead><tbody>';
                  let row = 1;
                  for (let i = 0; i < series.length; i++) {
                    for (let j = 0; j < series[i].data.length; j++, row++) {
                      if (j % 2)
                        table += '<tr style="background-color: #FFFFFF">'
                      else
                        table += '<tr style="background-color: #f1f1f1">'
                      table += '<td>' + row + '</td>'
                          + '<td>' + i + '</td>'
                          + '<td>' + series[i].data[j][0] + '</td>'
                          + '<td>' + series[i].data[j][1] + '</td>'
                          + '<td>' + series[i].data[j][2] + '</td>'
                          + '</tr>';
                    }
                  }
                  table += '</tbody></table>';
                  return table;
                }
              },
              dataZoom: {},
              brush: {
                type: ['rect', 'polygon', 'keep', 'clear'],
              },
              saveAsImage: {
                pixelRatio: 2,
              },
            },
          },
          brush: {
            throttleType: 'debounce',
            throttleDelay: 300,
            seriesIndex: [1],
            inBrush: {
              symbol: 'emptyCircle',
              symbolSize: 6,
              color: '#ee6666',
            },
            outOfBrush: {
              colorAlpha: 1
            }
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
              data: points_0.map((data) => {
                return [data.x, data.y];
              }),
            },
            {
              name: '1',
              type: 'scatter',
              symbolSize: 6,
              // prettier-ignore
              data: points_1.map((data) => {
                return [data.x, data.y, data.ood_score];
              }),
            },
            {
              name: '2',
              type: 'scatter',
              symbolSize: 6,
              // prettier-ignore
              data: points_2.map((data) => {
                return [data.x, data.y];
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
          console.log(params);
          if (params.batch[0].selected[0]) {
            let index1 = 0
            for (let i = 0; i < params.batch[0].selected.length; i++) {
              if (params.batch[0].selected[i].seriesIndex === 1) {
                index1 = i;
                break;
              }
            }
            // 输出被选中点的下标
            let selectedIndices1 = params.batch[0].selected[index1].dataIndex;
            let length = selectedIndices1.length

            bus.$emit('sendPointsLength', length); // 发送被选中的点的数量
            let selectedPoints = [];
            selectedIndices1.forEach((index) => {
              selectedPoints.push(allPoints[1][index]);
              /* option.series[1].data[index] = {
             value: [allPoints[1][index].x, allPoints[1][index].y, allPoints[1][index].ood_score],
             itemStyle: {
               color: '#ee6666'
             }
           }*/
            })
            /*allPoints[1].forEach((point, index) => {
          if (!selectedIndices1.includes(index)) {
            option.series[1].data[index] = {
              value: [point.x, point.y, point.ood_score],
              itemStyle: {
                color: '#91cc75'
              }
            }
          }
        })*/
            _this.selectedIndices1 = selectedIndices1;
            _this.selectedPointList = selectedPoints;
            myChart.setOption(option);
          }
        }

        let _this = this;

        //  输出选中的点
        myChart.on('brushSelected', renderBrushed);
        // 点击点时
        myChart.on('click', function (params) {
          if (_this.selectedFunc === false) { //查看
            _this.selectedPointList = [allPoints[params.seriesIndex][params.dataIndex]];
            _this.$bus.$emit('sendSelectedPoint', allPoints[params.seriesIndex][params.dataIndex]);
          } else if (params.seriesIndex === 1) { //删除
            _this.selectedDelPointList.push({
              index: params.dataIndex,
              data: allPoints[params.seriesIndex][params.dataIndex],
            })
            allPoints[params.seriesIndex][params.dataIndex] = null;
            if (params.seriesIndex === 1)
              option.series[params.seriesIndex].data[params.dataIndex] = [null, null, null];
            else
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
        let allPoints = this.allPoints;

        this.selectedIndices1.forEach(function (index) {
          selectedDelPointList.push({
            index: index,
            data: allPoints[1][index],
          })
          allPoints[1][index] = null;
          option.series[1].data[index] = [null, null, null];
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
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      let tail = this.selectedDelPointList.pop();
      let index = tail.index;
      let data = tail.data;
      let type = parseInt(tail.data.label);
      option.series[type].data[index] = [data.x, data.y, data.ood_score];
      this.allPoints[type][index] = data;
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
        let index = tail.index;
        let data = tail.data;
        let type = parseInt(tail.data.label);
        option.series[type].data[index] = [data.x, data.y, data.ood_score];
        this.allPoints[type][index] = data;
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
      for (let i = 0; i < this.allPoints[1].length; i++) {
        if (this.allPoints[1][i]) {
          let index = Math.floor((parseFloat(this.allPoints[1][i].ood_score) - this.minOod) / groupWidth);
          if (index >= selectedGroup.length) {
            index = this.groupNum - 1;
          }
          if (selectedGroup[index]) {
            option.series[1].data[i] = {
              value: [this.allPoints[1][i].x, this.allPoints[1][i].y, this.allPoints[1][i].ood_score],
              itemStyle: {
                color: '#ee6666'
              }
            };
          } else {
            option.series[1].data[i] = [this.allPoints[1][i].x, this.allPoints[1][i].y, this.allPoints[1][i].ood_score];
          }
        }
      }
      myChart.setOption(option);
    },
    reset() {
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      this.allPoints[1].forEach(function (point, index) {
        if (point)
          option.series[1].data[index] = [point.x, point.y, point.ood_score];
      });
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
      let myChart = this.dimensionReductionChart;
      let option = this.option;
      if (selection === 'true') {
        option.visualMap = {
          type: 'continuous',
          min: this.minOod,
          max: this.maxOod,
          seriesIndex: 1,
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
          },
        };
        delete option.series[2]
        option.series[0].emphasis = {
          focus: 'series'
        }
        option.series[1].emphasis = {
          focus: 'series',
        }
        option.legend = {
          title: 'Legend',
          data: ['0', '1'],
          left: 'center',
          bottom: 10
        }
      } else {
        delete option.visualMap;
        delete option.series[0].emphasis;
        delete option.series[1].emphasis;
        option.series[2] = {
          name: '2',
          type: 'scatter',
          symbolSize: 6,
          // prettier-ignore
          data: this.allPoints[2].map((data) => {
            return [data.x, data.y];
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
  },
  mounted() {
    // 初始化/切换界面
    this.$bus.$on('sendProjectionMethod', (projectionMethod) => {
      if (this.dimensionReductionChart) {
        this.dimensionReductionChart.dispose()
        this.selectedDelPointList = [];
        this.selectedPointList = [];
      }
      if (projectionMethod === '无') {
      } else if (projectionMethod === 'T-SNE算法') {
        this.paint('static/牛逼d.csv')
      } else if (projectionMethod === '训练后T-SNE算法') {
        this.paint('static/data训练后TSNE.csv')
      } else if (projectionMethod === 'PCA算法') {
        this.paint('static/pca牛逼d.csv')
      } else if (projectionMethod === '训练后PCA算法') {
        this.paint('static/data训练后PCA.csv')
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