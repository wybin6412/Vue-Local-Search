<template>
  <section>
    <el-container>
      <!-- <el-aside width="1px"></el-aside> -->
      <el-main>
        <!--工具条-->
        <el-col
          :span="24"
          class="toolbar"
          style="background-color: #FAFAFA;padding-top: 10px;padding-bottom: 0px;"
        >
          <el-form
            :inline="true"
            :model="getForm"
            :rules="getRules"
            ref="getForm"
            @submit.native.prevent
            size="mini"
          >
            <el-form-item label style="padding-left: 10px;">
              
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                 仓库<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="http://119:5180/apiui/">测试 301</el-dropdown-item>
                
                </el-dropdown-menu>
              </el-dropdown>
            </el-form-item>
            <el-form-item label prop="WHID" style="padding-left: 0px;">
              <el-tag type="info">{{"已登录" + getForm.WHName}}</el-tag>
              <!-- <span class="el-dropdown-link">{{getForm.WHName}}</span> -->
              <!-- <el-select v-model="getForm.WHID" disabled  placeholder="请选择仓库" >
                <el-option :key="0" :label="'未选择仓库'" :value="0"></el-option>
                <el-option
                  v-for="item in wareHouses"
                  :key="item.Id"
                  :label="item.WHName"
                  :value="item.Id"
                ></el-option>
              </el-select>-->
            </el-form-item>
            <el-form-item label="数据" prop="TableName">
              <!-- <el-select v-model="getForm.TableName" placeholder="请选择要查询的数据">
                <el-option :key="0" :label="'未选择业务'" :value="''"></el-option>
                <el-option
                  v-for="item in tableNames"
                  :key="item.TbName"
                  :label="item.TbName"
                  :value="item.TbName"
                ></el-option>
              </el-select> -->
              <el-select v-model="getForm.TableName" filterable placeholder="选择要查的数据(可搜索)">
                 <el-option-group
                  v-for="group in tableNames"
                  :key="group.label"
                  :label="group.label">
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    <span style="float: left">{{ item.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="getForm.KeyStr" placeholder="输入数据的关键字(回传数据可模糊查询)" style="width: 260px;"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleGetData">查询</el-button>
            </el-form-item>
            <el-form-item style="padding-left: 10px;">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-upload2"
                v-show="showOpt"
                key="showOptkey2"
                @click="batchReUpload"
                :disabled="this.sels.length===0"
              >重 推</el-button>
            </el-form-item>

            <el-pagination
              small
              layout="total"
              @current-change="handleCurrentChange"
              :page-size="total"
              :total="total"
              style="float:right;"
            ></el-pagination>
          </el-form>
        </el-col>

        <!--列表-->
        <el-table
          :data="dataList"
          :row-style="{height:'20px'}"
          :cell-style="{padding:'0px'}"
          :header-cell-style="{padding:'0px'}"
          key="tableData"
          stripe
          border
          :height="tableHeight"
          highlight-current-row
          v-loading="listLoading"
          @selection-change="selsChange"
          style="font-size:12px;font-family:Microsoft YaHei;width: 100%;"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="selection" width="45" fixed></el-table-column>
          <el-table-column type="index" label="序号" width="50" fixed></el-table-column>

          <template v-for="item in tableHead">
            <el-table-column
              :label="item.Name"
              :prop="item.Name"
              :width="160"
              :key="item.Name"
              :formatter="formatBoolean"
              align="center"
              sortable
              show-overflow-tooltip
            ></el-table-column>
          </template>

          <el-table-column
            label="操作"
            width="60"
            align="center"
            v-if="showOptDetail"
            key="showOptkey111"
            fixed
          >
            <template scope="scope">
              <el-button type="text" size="small" @click="handleDetail(scope.$index, scope.row)">详情</el-button>
              <!-- <el-button
                type="danger" plain
                size="small"
                @click="handleReUpload(scope.$index, scope.row)"
                v-show="showOpt"
                key="showOptkey11"
              >重推</el-button>-->
            </template>
          </el-table-column>
        </el-table>

        <!--工具条-->
        <!-- <el-col :span="24" class="toolbar"  style="padding-top: 4px;padding-left: 10px;">
          <el-button type="danger"  size="mini" v-show="showOpt" key="showOptkey2" @click="batchReUpload" :disabled="this.sels.length===0">重 推</el-button>
          <el-pagination
            small
            layout="total,prev, pager, next"
            @current-change="handleCurrentChange"
            :page-size="total"
            :total="total"
            style="float:right;"
          ></el-pagination>
        </el-col>-->

        <!--详情界面-->
        <el-dialog
          title="详情"
          :visible.sync="editFormVisible"
          v-model="editFormVisible"
          :close-on-click-modal="false"
        >
          <el-form :model="editForm" label-width="80px" ref="editForm" size="mini">
            <el-form-item label="UniqueID:" prop="UniqueID">
              <!-- <el-input v-model="editForm.UniqueID" auto-complete="off"></el-input> -->
              <el-tag type="info">{{editForm.UniqueID}}</el-tag>
            </el-form-item>
            <el-form-item label="业务类型:" prop="DescrText">
              <!-- <el-input v-model="editForm.DescrText" auto-complete="off"></el-input> -->
              <el-tag type="info">{{editForm.DescrText + "," + editForm.DescrFrom }}</el-tag>
            </el-form-item>
            <!-- <el-form-item label="接口名称" prop="FullName">
              <el-input v-model="editForm.FullName" auto-complete="off"></el-input>
            </el-form-item>-->
            <el-form-item label="回传状态">
              <!-- <el-input v-if="editForm.OperateFlag === 1" value="成功"></el-input>
              <el-input v-else value="失败"></el-input>-->
              <el-tag v-if="editForm.OperateFlag === 1">回传成功， {{editForm.ExecResult}}</el-tag>
              <el-tag v-else-if="editForm.OperateFlag === 0 && editForm.ExecCount === 0">待回传</el-tag>
              <el-tag v-else-if="editForm.OperateFlag === 0 && editForm.ExecCount > 0" type="danger">回传失败， {{editForm.ExecResult}}</el-tag>
              <el-tag v-else-if="editForm.OperateFlag === 2">忽略不回传</el-tag>
              <el-tag v-else type="danger">回传失败， {{editForm.ExecResult}}</el-tag>
            </el-form-item>
            <el-form-item label="回传时间" prop="LastOperateDT">
              <!-- <el-input v-model="editForm.LastOperateDT" auto-complete="off"></el-input> -->
              <el-tag type="info">{{editForm.LastOperateDT}}</el-tag>
            </el-form-item>
            <el-form-item label="数据内容">
              <el-input type="textarea" v-model="editForm.Params" autosize></el-input>
            </el-form-item>
          </el-form>
          <!-- <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">关闭</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
          </div>-->
        </el-dialog>

        <!--新增界面-->
        <!-- <el-dialog
      title="新增"
      :visible.sync="addFormVisible"
      v-model="addFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="昵称" prop="uRealName">
          <el-input v-model="addForm.uRealName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录名" prop="uLoginName">
          <el-input v-model="addForm.uLoginName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="uLoginPWD">
          <el-input v-model="addForm.uLoginPWD" show-password auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="addForm.sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="addForm.age" :min="0" :max="200"></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker type="date" placeholder="选择日期" v-model="addForm.birth"></el-date-picker>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="addForm.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
        </el-dialog>-->
      </el-main>
      <!-- <el-aside width="1px"></el-aside> -->
    </el-container>
  </section>
</template>

<script>
import util from "../../../util/date";
import { getData, reuploadData } from "../../api/api";
import { truncate } from "fs";
import store from "@/store";

export default {
  data() {
    return {
      tableHeight: window.innerHeight - 100,
      showOpt: false,
      showOptDetail: false,
      dataList: [],
      tableHead: [
        {
          Name: "UniqueID"
        },
        {
          Name: "DescrText"
        },
        {
          Name: "FullName"
        },
        {
          Name: "OperateFlag"
        },
        {
          Name: "LastOperateDT"
        },
        {
          Name: "Params"
        }
      ],
    
      tableNames: [
        {
          label: "1数据回传ERP",
          options: [
            {
              value: "确认写入",
              label: "回传E：确认"
            }
          ]
        },
        {
          label: "2数据回传ERP",
          options: [
            {
              value: "InsertCustomerOrderBoxQC",
              label: "回传E：QC数据"
            }
            
          ]
        },
        {
          label: "3数据表",
          options: [
            {
              value: "dbo.TB_WMSCarrier",
              label: "本地库表：承运商信息"
            }
            
          ]
        }
      ],
      getRules: {
        TableName: [
          { required: true, message: "请选择业务类型", trigger: "blur" }
        ]
      },
      getForm: {
        WHID: "",
        WHName: "",
        TableName: "",
        KeyStr: ""
      },
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列
      editFormVisible: false, //详情界面是否显示
      editLoading: false,
      //详情界面数据
      editForm: {
        UniqueID: 0,
        DescrFrom: "",
        DescrText: "",
        FullName: "",
        TableName: "",
        Field: "",
        OperateFlag: 0,
        ExecResult: "",
        ExecCount: 0,
        LastOperateDT: "",
        Params: ""
      }

      // addFormVisible: false, //新增界面是否显示
      // addLoading: false,
      // addFormRules: {
      //   uLoginName: [
      //     { required: true, message: "请输入登录名", trigger: "blur" }
      //   ],
      //   uRealName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
      //   uLoginPWD: [{ required: true, message: "请输入密码", trigger: "blur" }],
      //   birth: [{ required: true, message: "请填写生日", trigger: "blur" }]
      // },
      //新增界面数据
      // addForm: {
      //   name: "",
      //   uLoginName: "",
      //   uRealName: "",
      //   uLoginPWD: "",
      //   sex: -1,
      //   age: 0,
      //   birth: "",
      //   addr: ""
      // }
    };
  },
  methods: {
    tableRowClassName: function(row, rowIndex) {
      var kStr = this.getForm.TableName.substring(0, 3);
      if (kStr == "dbo") {
        return "";
      } else {
        if (typeof row.row.OperateFlag === "undefined") {
          return "";
        } else {
          if (row.row.OperateFlag == 1) {
            // return 'success-row';
            return "";
          } else {
            return "warning-row";
          }
        }
      }
      return "";
    },
    formatBoolean: function (row, column, cellValue) {
      var ret = ''  //你想在页面展示的值 
      var colNameTmp = column.label;
      if(colNameTmp === "IsCancel" || colNameTmp === "IsTransfer" || colNameTmp === "Invalid" || colNameTmp==="IsComplete" || colNameTmp==="IsHandover"
        || colNameTmp==="ModifyFlag" || colNameTmp==="RestPay" || colNameTmp==="Presell" || colNameTmp==="IsLoad" || colNameTmp==="IsTailBox"
        || colNameTmp==="IsBlend" || colNameTmp==="IsCProduct" || colNameTmp==="IsScan" || colNameTmp==="IsSign" || colNameTmp==="IsUpload"){
         if (cellValue) {
          ret = "1"  //根据自己的需求设定
        } else {
          ret = "0"
        }
      }else{
        ret = cellValue; 
      }
     
      return ret;       
    },
    handleCommand(command) {
      // this.$message('click on item ' + command);
      if (command != "e") {
        //  window.location.href =command;
        window.open(command, "_blank");
      }
    },
    //性别显示转换
    formatSex: function(row, column) {
      return row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    formatBirth: function(row, column) {
      return !row.birth || row.birth == ""
        ? ""
        : util.formatDate.format(new Date(row.birth), "yyyy-MM-dd");
    },
    handleCurrentChange(val) {
      this.page = val;
      // this.getDataByKeyStr();
    },
    handleGetData() {
      this.$refs.getForm.validate(valid => {
        if (valid) {
          this.getDataByKeyStr();
        } else {
          console.log("error getdata!");
          return false;
        }
      });
    },
    //根据关键字查询数据
    getDataByKeyStr() {
      // var tmptableName = "";
      // var endIndex = this.getForm.TableName.indexOf("|");
      // if (endIndex > 0) {
      //   tmptableName = this.getForm.TableName.substring(0, endIndex);
      // } else {
      //   tmptableName = this.getForm.TableName;
      // }

      let para = {
        WHID: this.getForm.WHID,
        TableName: this.getForm.TableName,
        KeyStr: this.getForm.KeyStr
      };
      this.listLoading = true;

      //NProgress.start();

      getData(para).then(res => {
        var _this = this;
        if (util.isEmt.format(res)) {
          _this.listLoading = false;
          _this.$message({
            message: `查询失败，服务器出错啦`,
            type: "error",
            duration: 3000
          });
          return;
        }

        this.listLoading = false;

        if (!res.data.retObj.success) {
          _this.$message({
            message: res.data.retObj.message,
            // message: `失败`,
            type: "error",
            duration: 3000
          });

          this.total = 0;
          this.dataList = [];
          this.tableHead = [];
        } else {
          this.total = res.data.retObj.listCount;
          this.dataList = res.data.retObj.list;
          this.tableHead = res.data.retObj.tableHead;
        }

        if (this.dataList.length > 0) {
          var kStr = this.getForm.TableName.substring(0, 3);
          if (kStr == "dbo") {
            this.showOpt = false;
            this.showOptDetail = false;
          } else {
            this.showOpt = true;
            this.showOptDetail = true;
            // if (kStr == "KYW") {
            //   this.showOptDetail = true;
            // } else {
            //   this.showOptDetail = false;
            // }
          }
        } else {
          this.showOpt = false;
          this.showOptDetail = false;
        }
        //NProgress.done();
      });
    },

    //重推
    handleReUpload: function(index, row) {
      this.$confirm("确认重推该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = {
            WHID: this.getForm.WHID,
            TableName: this.getForm.TableName,
            Ids: row.UniqueID
          };
          reuploadData(para).then(res => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.data.retObj.success) {
              this.$message({
                message: "重推成功",
                type: "success",
                duration: 3000
              });
            } else {
              this.$message({
                message: "重推失败" + res.data.retObj.message,
                type: "error",
                duration: 3000
              });
            }

            this.getDataByKeyStr();
          });
        })
        .catch(() => {});
    },
    //显示详情界面
    handleDetail: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    // handleAdd() {
    //   this.addFormVisible = true;
    //   this.addForm = {
    //     uLoginName: "",
    //     uRealName: "",
    //     uLoginPWD: "",
    //     name: "",
    //     sex: -1,
    //     age: 0,
    //     birth: "",
    //     addr: ""
    //   };
    // },
    //详情
    // editSubmit: function() {
    //   this.$refs.editForm.validate(valid => {
    //     if (valid) {
    //       this.$confirm("确认提交吗？", "提示", {}).then(() => {
    //         this.editLoading = true;
    //         //NProgress.start();
    //         let para = Object.assign({}, this.editForm);

    //         para.birth =
    //           !para.birth || para.birth == ""
    //             ? util.formatDate.format(new Date(), "yyyy-MM-dd")
    //             : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

    //         editUser(para).then(res => {
    //           if (util.isEmt.format(res)) {
    //             this.editLoading = false;
    //             return;
    //           }
    //           if (res.data.success) {
    //             this.editLoading = false;
    //             //NProgress.done();
    //             this.$message({
    //               message: res.data.msg,
    //               type: "success"
    //             });
    //             this.$refs["editForm"].resetFields();
    //             this.editFormVisible = false;
    //             this.getUsers();
    //           } else {
    //             this.$message({
    //               message: res.data.msg,
    //               type: "error"
    //             });
    //           }
    //         });
    //       });
    //     }
    //   });
    // },
    //新增
    // addSubmit: function() {
    //   this.$refs.addForm.validate(valid => {
    //     if (valid) {
    //       this.$confirm("确认提交吗？", "提示", {}).then(() => {
    //         this.addLoading = true;
    //         //NProgress.start();
    //         let para = Object.assign({}, this.addForm);
    //         para.birth =
    //           !para.birth || para.birth == ""
    //             ? util.formatDate.format(new Date(), "yyyy-MM-dd")
    //             : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");
    //         addUser(para).then(res => {
    //           if (util.isEmt.format(res)) {
    //             this.addLoading = false;
    //             return;
    //           }

    //           if (res.data.success) {
    //             this.addLoading = false;
    //             //NProgress.done();
    //             this.$message({
    //               message: res.data.msg,
    //               type: "success"
    //             });
    //             this.$refs["addForm"].resetFields();
    //             this.addFormVisible = false;
    //             this.getUsers();
    //           } else {
    //             this.$message({
    //               message: res.data.msg,
    //               type: "error"
    //             });
    //           }
    //         });
    //       });
    //     }
    //   });
    // },
    selsChange: function(sels) {
      this.sels = sels;
    },
    //批量重推
    batchReUpload: function() {
      var ids = this.sels.map(item => item.UniqueID).toString();
      this.$confirm(
        "确认重推选中的记录吗？" + "共 " + this.sels.length + " 条",
        "提示",
        {
          type: "warning"
        }
      )
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = {
            WHID: this.getForm.WHID,
            TableName: this.getForm.TableName,
            Ids: ids
          };

          reuploadData(para).then(res => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              this.$message({
                message: "重推失败，服务器出错啦",
                type: "error",
                duration: 3000
              });
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.data.retObj.success) {
              this.$message({
                message: "重推成功",
                type: "success",
                duration: 3000
              });
            } else {
              this.$message({
                message: "重推失败" + res.data.retObj.message,
                type: "error",
                duration: 3000
              });
            }

            this.getDataByKeyStr();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    // this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 50;
  },
  created() {
    var endIndex = window.location.href.indexOf("/apiui");
    var port = window.location.href.substring(endIndex - 5, endIndex);
    if (port == ":2364") {
      this.getForm.WHID = ":5180";
    } else {
      this.getForm.WHID = port;
    }

    if (this.getForm.WHID == ":5180") {
      this.getForm.WHName = "1测试" + "301";
    } else if (this.getForm.WHID == ":5480") {
      this.getForm.WHName = "2测试" + "101";
    } 
  },
  watch: {}
};
</script>

<style >
.el-aside {
  /* background-color: #ced3d3; */
  background: #edf4ed;
  /* background: -webkit-linear-gradient(top left, #edf4ed 0%, #53e3a6 100%);
  background: linear-gradient(to bottom right, #127c7b 0, #edf4ed);
  opacity: 0.8; */
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background: #edf4ed;
  background: -webkit-linear-gradient(top left, #edf4ed 0%, #53e3a6 100%);
  background: linear-gradient(to bottom right, #127c7b 0, #edf4ed);
  /* opacity: 0.8; */
  color: #333;
  /* text-align: center; */
  line-height: 10px;
}
/* body > .el-container {
    margin-bottom: 40px;
  } */

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.el-dropdown-link {
  cursor: pointer;
  /* color: #409EFF; */
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
