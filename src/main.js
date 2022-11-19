import Vue from 'vue'
import App from './App.vue'
import {
    Button,
    Select,
    Container,
    Aside,
    Header,
    Main,
    Footer,
    Menu,
    MenuItem,
    Submenu,
    Avatar,
    Steps,
    Step,
    Option,
    Radio,
    RadioGroup,
    InputNumber,
    Row,
    Col,
    Switch,
    Image,
    Backtop,
    Progress,
    Table,
    TableColumn,
} from 'element-ui';

Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
Vue.component(Container.name, Container);
Vue.component(Aside.name, Aside);
Vue.component(Header.name, Header);
Vue.component(Main.name, Main);
Vue.component(Footer.name, Footer);
Vue.component(Menu.name, Menu);
Vue.component(MenuItem.name, MenuItem);
Vue.component(Submenu.name, Submenu);
Vue.component(Avatar.name, Avatar);
Vue.component(Steps.name, Steps);
Vue.component(Step.name, Step);
Vue.component(Option.name, Option);
Vue.component(Radio.name, Radio);
Vue.component(RadioGroup.name, RadioGroup);
Vue.component(InputNumber.name, InputNumber);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Switch.name, Switch);
Vue.component(Image.name, Image);
Vue.component(Backtop.name, Backtop);
Vue.component(Progress.name, Progress);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);

Vue.config.productionTip = false

new Vue({
    // 全局事件总线
    beforeCreate() {
        Vue.prototype.$bus = this
    },
    render: h => h(App),
}).$mount('#app')
