<template>
  <div style="margin-top: 30px;">
    <div style="margin: 20px;">查询工具</div>

    <el-card>
      <el-aside>请勿随意操作，谨慎处理数据！</el-aside>
       <el-button type="text"  @click="backSearch">返回查询界面</el-button>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Welcome",
  methods: {
    backSearch: function() {
        this.$router.push('/user');
        }
    },
  mounted() {
    var curTime = new Date();
    if(window.localStorage.TokenExpire){
        var expiretime = new Date(Date.parse(window.localStorage.TokenExpire));
        if(curTime>=expiretime){
            this.$router.push('/login');
        }
    }else {
        this.$router.push('/login');
    }
  }
}

</script>

<style scoped>

</style>