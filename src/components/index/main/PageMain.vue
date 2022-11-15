<template>
  <ul>
    <li>
      <basic-info/>
      <user-options/>
    </li>
    <li style="width: 100%">
      <dimension-reduction/>
    </li>
    <li>
      <visual-analysis/>
      <pic-exhibition/>
    </li>
  </ul>
</template>


<script>
import BasicInfo from "@/components/index/main/basicInfo/BasicInfo";
import UserOptions from "@/components/index/main/userOptions/UserOptions";
import DimensionReduction from "@/components/index/main/dimensionReduction/DimensionReduction";
import VisualAnalysis from "@/components/index/main/visualAnalysisArea/VisualAnalysis";
import PicExhibition from "@/components/index/main/picExhibition/PicExhibition";
import DimensionReduction2 from "@/components/index/main/dimensionReduction/DimensionReduction2";

export default {
  name: "PageMain",

  components: {
    BasicInfo,
    UserOptions,
    DimensionReduction,
    DimensionReduction2,
    VisualAnalysis,
    PicExhibition,
  },
}
</script>

<style scoped>
ul {
  list-style-type: none;
  /*横向排列*/
  display: flex;
  padding: 0;
  margin: 0;
  height: 100%;
}
</style>