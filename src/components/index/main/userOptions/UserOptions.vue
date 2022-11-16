<template>
  <div id="user-options">
    <div id="user-options-title">
      用户选项
    </div>
    <div id="user-options-body">
      <table style="width: 290px">
        <tr>
          <td class="user-options-body-text">选择降维方法</td>
          <td>
            <el-select v-model="projectionMethod" placeholder="请选择" size="small">
              <el-option
                  v-for="item in projectionMethods"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text">设置直方图分组数量</td>
          <td>
            <el-input-number
                v-model="histogramGroupNum"
                :min="1" :max="10"
                size="small"
                :disabled="projectionMethod==='无'">
            </el-input-number>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text">切换选中点集功能</td>
          <td>
            <el-switch
                style="display: block"
                v-model="switchSelectedFunc"
                active-color="#ff4949"
                inactive-color="#13ce66"
                active-text="删除"
                inactive-text="查看"
                :disabled="projectionMethod==='无'">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text"></td>
          <td v-show="switchSelectedFunc">
            <el-button type="danger" plain @click="deleteSelectedPoints">删除选中</el-button>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text" v-show="switchSelectedFunc">
            <el-button @click="withdraw">撤回删除</el-button>
          </td>
          <td v-show="switchSelectedFunc">
            <el-button @click="withdraw10">撤回10个删除</el-button>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text">是否将ood得分映射到颜色值域</td>
          <td>
            <el-radio-group v-model="oodScoreToColor" :disabled="projectionMethod==='无'">
              <el-radio label="true">是</el-radio>
              <el-radio label="false">否</el-radio>
            </el-radio-group>
          </td>
        </tr>
        <tr>
          <td class="user-options-body-text">导出已挑选的数据</td>
          <td>
            <el-button
                type="primary"
                size="small"
                @click="exportPickedData"
                :disabled="projectionMethod==='无'||Boolean(allPicNum)&&allPicNum!==compressedPicNum">
              导 出
            </el-button>
            <a :href="picHref" :download="picDownload" ref="download" v-show="false">导 出</a>
          </td>
        </tr>
      </table>
      <el-progress
          v-show="Boolean(allPicNum)"
          :percentage="allPicNum===0?0:Math.round((compressedPicNum/allPicNum)*100)"
          :stroke-width="20"
          :text-inside="true"
          style="width: 280px"
          class="user-options-body-text">
      </el-progress>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";
import {saveAs} from 'file-saver';
import lrz from 'lrz';

export default {
  name: "UserOptions",

  data() {
    return {
      projectionMethod: "无",
      projectionMethods: [
        {
          value: "T-SNE算法",
          label: "T-SNE算法",
        },
        {
          value: "训练后T-SNE算法",
          label: "训练后T-SNE算法",
        },
        {
          value: "PCA算法",
          label: "PCA算法",
        },
        {
          value: "训练后PCA算法",
          label: "训练后PCA算法",
        },
      ],
      histogramGroup: "true",
      histogramGroupNum: 5,
      pickData: "false",
      deleteData: "false",
      selectData: "false",
      oodScoreToColor: "false",
      switchSelectedFunc: false,
      picHref: "",
      picDownload: "",
      compressedPicNum: 0,
      allPicNum: 0,
      zip: new JSZip(),
    };
  },

  methods: {
    exportPickedData() {
      this.$bus.$emit("exportPickedData");
    },
    deleteSelectedPoints() {
      this.$bus.$emit("deleteSelectedPoints");
    },
    withdraw() {
      this.$bus.$emit("sendWithdraw", true);
    },
    withdraw10() {
      this.$bus.$emit("sendWithdraw10", true);
    }
  },

  watch: {
    histogramGroupNum() {
      this.$bus.$emit("sendHistogramGroupNum", this.histogramGroupNum);
    },
    switchSelectedFunc() {
      this.$bus.$emit("sendSwitchSelectedFunc", this.switchSelectedFunc);
    },
    projectionMethod() {
      this.$bus.$emit("sendProjectionMethod", this.projectionMethod, this.histogramGroupNum);
      this.oodScoreToColor = "false";
    },
    compressedPicNum() {
      if (this.compressedPicNum >= this.allPicNum) {
        this.zip.generateAsync({type: "blob"}).then((content) => {
          saveAs(content, "pickedData.zip");
        });
        delete this.zip;
        this.zip = new JSZip();
      }
    },
    oodScoreToColor() {
      this.$bus.$emit("sendOodScoreToColor", this.oodScoreToColor);
    }
  },

  mounted() {
    this.$bus.$on("sentSelectedPointList", (selectedPointList) => {
      if (selectedPointList && selectedPointList.length) {
        this.allPicNum = selectedPointList.length;
        this.compressedPicNum = 0;
        for (let i = 0; i < selectedPointList.length; i++) {
          let pic_name = selectedPointList[i].pic_name;
          // 获取Tomcat的工程路径
          let path = window.document.location.href;
          let pic_url = path + "/static/qp/" + pic_name;
          lrz(pic_url, {quality: 1}).then((rst) => {
            this.zip.file(pic_name, rst.file, {binary: true});
            this.compressedPicNum++;
          });
        }
      } else {
        this.allPicNum = 0;
      }
    });
  }

}
</script>

<style scoped>
#user-options {
  border: #409EFF 3px solid;
  border-radius: 12px;
  background: linear-gradient(to bottom, #409EFF 6%, #FFFFFF 30px);
  text-align: left;
  width: 300px;
  height: 450px;
}

#user-options-title {
  text-align: center;
  font: bold 20px "Microsoft YaHei";
  color: #FFFFFF;
}

#user-options-body {
  text-align: center;
  font: 15px/30px "Microsoft YaHei";
  padding: 10px;
}

.user-options-body-text {
  text-align: left;
  font: 16px/30px "Microsoft YaHei";
  width: 180px;
}

</style>