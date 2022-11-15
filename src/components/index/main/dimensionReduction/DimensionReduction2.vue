<template>
  <div id="dim-red">
    <div id="dim-red-title">
      降维显示效果图
    </div>
    <div id="dim-red-body">
      <!--            <svg id="MainSVG" ref="MainSVG"></svg>-->
      <div id="main"></div>
    </div>
  </div>
</template>

<script>
//引入d3库
import * as d3 from 'd3';
//引入echarts库
import * as echarts from 'echarts';
import ecStat from 'echarts-stat';

export default {
  name: "DimensionReduction2",

  data() {
    return {
      dataset: [],
      selectedFunc: false, // false: 查看，true: 删除
      selectedDataList: [],
      chart: null,
    }
  },

  methods: {
    paint1() {
      let width = this.$refs.MainSVG.clientWidth;
      let height = this.$refs.MainSVG.clientHeight;
      d3.csv("static/data训练后PCA.csv").then(dataset => {
            //画散点图
            d3.select('#MainSVG').selectAll('circle')
                .data(dataset)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                  return d.x * 20 + width / 2.2;
                })
                .attr('cy', function (d) {
                  return -d.y * 1500 + height / 2;
                })
                .attr('r', 3)
                .attr('fill', function (d) {
                  switch (d.label) {
                    case '0':
                      return 'green';
                    case '1':
                      return 'blue';
                    case '2':
                      return 'red';
                  }
                })
          }
      )
      //屏幕缩放时
      window.onresize = () => {
        //清空画布
        d3.select('#MainSVG').selectAll('circle').remove();
        this.paint();
      };

    },
    paint2() {
      // 读取数据
      d3.csv("static/data训练后PCA.csv").then(dataset => {
        let points1 = [];
        let points2 = [];
        let points3 = [];
        let ood = [];
        let maxOod = dataset[0].ood_score, minOod = dataset[0].ood_score;
        for (let i = 0; i < dataset.length; i++) {
          this.dataset[i] = dataset[i];
          this.dataset[i].index = i;
          switch (dataset[i].label) {
            case "0":
              points1.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
            case "1":
              points2.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
            case "2":
              points3.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
          }
          //找到ood的最大值和最小值
          if (!isNaN(dataset[i].ood_score)) {
            ood.push(dataset[i].ood_score);
            if (this.dataset[i].ood_score > maxOod) {
              maxOod = dataset[i].ood_score;
            } else if (dataset[i].ood_score < minOod) {
              minOod = dataset[i].ood_score;
            }
          }
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
              dataZoom: {},
              brush: {
                type: ['rect', 'polygon', 'clear']
              }
            }
          },
          brush: {},
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
                show: false
              }
            }
          ],
          series: [
            {
              name: '0',
              type: 'scatter',
              symbolSize: 6,
              emphasis: {
                focus: 'series'
              },
              // prettier-ignore
              data: points1,
              markArea: {
                silent: true,
                itemStyle: {
                  color: 'transparent',
                },
              },
            },
            {
              name: '1',
              type: 'scatter',
              symbolSize: 6,
              emphasis: {
                focus: 'series'
              },
              // prettier-ignore
              data: points2,
              markArea: {
                silent: true,
                itemStyle: {
                  color: 'transparent',
                },
              },
            },
            {
              name: '2',
              type: 'scatter',
              symbolSize: 6,
              emphasis: {
                focus: 'series'
              },
              // prettier-ignore
              data: points3,
              markArea: {
                silent: true,
                itemStyle: {
                  color: 'transparent',
                },
              },
            },
          ]
        };

        option && myChart.setOption(option);
        this.chart = myChart;


        let bus = this.$bus;

        function renderBrushed(params) {
          let option = _this.chart.getOption()
          // 输出被选中点的下标
          let selectedIndices1 = params.batch[0].selected[0].dataIndex;
          let selectedIndices2 = params.batch[0].selected[1].dataIndex;
          let selectedIndices3 = params.batch[0].selected[2].dataIndex;
          let length = selectedIndices1.length + selectedIndices2.length + selectedIndices3.length

          if (_this.selectedFunc === false) { //查看
            bus.$emit('sendPointsLength', selectedIndices1.length + selectedIndices2.length + selectedIndices3.length); // 发送被选中的点的数量
          } else if (length > 0) { //删除
            selectedIndices1.forEach(function (item) {
              _this.selectedDataList.push({
                index: item,
                data: _this.dataset[item],
                type: 0
              })
              option.series[0].data[item] = null;
            });
            selectedIndices2.forEach(function (item) {
              _this.selectedDataList.push({
                index: item,
                data: _this.dataset[item],
                type: 1
              })
              option.series[1].data[item] = null;
            });
            selectedIndices3.forEach(function (item) {
              _this.selectedDataList.push({
                index: item,
                data: _this.dataset[item],
                type: 2
              })
              option.series[2].data[item] = null;
            });
            myChart.setOption(option);
          }
          // myChart.setOption(option);
        }

        let _this = this;

        //  输出选中的点
        myChart.on('brushSelected', renderBrushed);
        // 点击点时
        myChart.on('click', function (params) {
          console.log(_this.selectedFunc);
          console.log(params);
          if (_this.selectedFunc === false) { //查看
            _this.$bus.$emit('sendSelectedPoint', _this.dataset[params.dataIndex]);
          } else { //删除
            _this.selectedDataList.push({
              index: params.dataIndex,
              data: _this.dataset[params.dataIndex],
              type: params.seriesIndex
            })
            let option = _this.chart.getOption()
            option.series[params.seriesIndex].data[params.dataIndex] = null;
            myChart.setOption(option);
          }
        });
      });
    },
    paint3() {
      d3.csv("static/data训练后PCA.csv").then(dataset => {
        let points1 = [];
        let points2 = [];
        let points3 = [];
        for (let i = 0; i < dataset.length; i++) {
          points1.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
          /*switch (dataset[i].label) {
            case "0":
              points1.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
            case "1":
              points2.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
            case "2":
              points3.push([parseFloat(dataset[i].x), parseFloat(dataset[i].y)]);
              break;
          }*/
        }

        var chartDom = document.getElementById('main');
        var myChart = echarts.init(chartDom);
        var option;

// See https://github.com/ecomfe/echarts-stat
        echarts.registerTransform(ecStat.transform.clustering);
        var CLUSTER_COUNT = 6;
        var DIENSIION_CLUSTER_INDEX = 2;
        var COLOR_ALL = [
          '#37A2DA',
          '#e06343',
          '#37a354',
          '#b55dba',
          '#b5bd48',
          '#8378EA',
          '#96BFFF'
        ];
        var pieces = [];
        for (var i = 0; i < CLUSTER_COUNT; i++) {
          pieces.push({
            value: i,
            label: 'cluster ' + i,
            color: COLOR_ALL[i]
          });
        }
        option = {
          dataset: [
            {
              source: points1
            },
            {
              transform: {
                type: 'ecStat:clustering',
                // print: true,
                config: {
                  clusterCount: CLUSTER_COUNT,
                  outputType: 'single',
                  outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX
                }
              }
            }
          ],
          tooltip: {
            position: 'top'
          },
          visualMap: {
            type: 'piecewise',
            top: 'middle',
            min: 0,
            max: CLUSTER_COUNT,
            left: 10,
            splitNumber: CLUSTER_COUNT,
            dimension: DIENSIION_CLUSTER_INDEX,
            pieces: pieces
          },
          grid: {
            left: 120
          },
          xAxis: {},
          yAxis: {},
          series: {
            type: 'scatter',
            encode: {tooltip: [0, 1]},
            symbolSize: 15,
            itemStyle: {
              borderColor: '#555'
            },
            datasetIndex: 1
          }
        };

        option && myChart.setOption(option);

      })

    },
    withdraw() {
      if (this.selectedDataList.length <= 0) {
        alert("已经没有删除的点可以撤回了哟~")
        return;
      }
      let option = this.chart.getOption();
      let tail = this.selectedDataList.pop();
      let index = tail.index
      let type = tail.type
      let data = tail.data;
      option.series[type].data[index] = [data.x, data.y]
      this.dataset[index] = data
      this.chart.setOption(option);
    },
    withdraw10() {
      if (this.selectedDataList.length <= 0) {
        alert("已经没有删除的点可以撤回了哟~")
        return;
      }
      let option = this.chart.getOption();
      console.log(this.selectedDataList.length);
      let length = this.selectedDataList.length;
      for (let i = 0; i < Math.min(length, 10); i++) {
        let tail = this.selectedDataList.pop();
        let index = tail.index
        let type = tail.type
        let data = tail.data;
        option.series[type].data[index] = [data.x, data.y]
        this.dataset[index] = data
      }
      this.chart.setOption(option);
    }
  },

  mounted() {
    this.paint2();
    // 切换查找/删除功能
    this.$bus.$on('sendSwitchSelectedFunc', (switchSelectedFunc) => {
      console.log('hhhh')
      this.selectedFunc = switchSelectedFunc;
    });
    this.$bus.$on('sendWithdraw', this.withdraw)
    this.$bus.$on('sendWithdraw10', this.withdraw10)

  }
}
</script>

<style scoped>
#dim-red {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 4%, #FFFFFF 30px);
  /* width: 800px;*/
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

#MainSVG {
  width: 100%;
  height: 650px;
}

#main {
  height: 650px;
}
</style>