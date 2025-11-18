Vue.component("Switcher-inspector", {
  template: `
  <ui-prop name="当前选择" >
    <ui-node class="flex-1" v-value="target._currentChild.value.uuid"></ui-node>
    <ui-button class="green tiny" v-on:click="resizeToCurrent">设置为当前大小</ui-button>
  </ui-prop>
  <div class="layout horizontal end-justified">
    <ui-button class="blue" v-on:click="switch">切换</ui-button>
  </div>
  <ui-prop v-prop="target.interactable" v-on:change="onCheck">
  </ui-prop>
  `,

  props: {
    target: {
      twoWay: true,
      type: Object
    }
  },
  data: () => {
    return {
      test_: "test"
    };
  },
  methods: {
    switch: function() {
      console.log(this.target);
      var t = {
        id: this.target.uuid.value,
        path: "index",
        type: "Interger",
        isSubProp: false,
        value:
          (this.target._currentIndex.value + 1) %
          this.target._childrenCount.value
      };
      Editor.Ipc.sendToPanel("scene", "scene:set-property", t);
    },

    onCheck: function(e) {
      var v = e.detail.value;
      var t = {
        id: this.target.uuid.value,
        path: "_checkInteractive",
        type: "Boolean",
        isSubProp: false,
        value: v
      };
      Editor.Ipc.sendToPanel("scene", "scene:set-property", t);
    },

    resizeToCurrent: function() {
      var t = {
        id: this.target.uuid.value,
        path: "resizeToCurrent",
        type: "Boolean",
        isSubProp: false,
        value: true
      };
      Editor.Ipc.sendToPanel("scene", "scene:set-property", t);
    },
    test: function() {
      console.log(this.target);
    }
  }
});
