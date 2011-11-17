var Controls = Backbone.View.extend(_.extend({}, StateMachine, {

  className: 'controls',

  events: {
    'click .insert a': 'insert',
    'click .move a': 'move'
  },

  initialize: function (options) {
    this.state    = 'read';
    this.root     = options.root;
    this.level    = options.level;
    this.position = options.position;
  },

  transitionTo: function (state) {
    StateMachine.transitionTo.call(this, state);
    this.render();
  },

  getPositionFromEl: function (el) {
    var parentId = el.attr('data-parent')
    ,   afterId = el.attr('data-after')
    
    return new Position(
      graph.get(parentId),
      afterId ? graph.get(afterId) : null
    );
  },

  insert: function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    var target = $(e.target)
    ,   position = this.getPositionFromEl(target)
    ,   type = target.attr('data-type');
    
    createNode(type, position);
  },

  move: function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    var target = $(e.target)
    ,   position = this.getPositionFromEl(target);
    
    removeChildTemporary(this.root.movedParent, this.root.movedNode);
    addChild(this.root.movedNode, position);
    this.root.transitionTo('write');
  },

  render: function () {
    $(this.el).html(this.invokeForState('render'));
    return this;
  }

}), {

  states: {
    read: {
      render: function () {
        return '';
      }
    },
    write: {
      render: function () {
        var self = this;
        
        var childTypes = new Data.Hash();
        possibleChildTypes(this.position).each(function (val, type) {
          if (type !== '/type/section' || val.length == 1) {
            childTypes.set(type, _.last(val));
          } else {
            var level = self.level + 1;
            childTypes.set(type, _.map(val, function (position) {
              position.level = level;
              level++;
              return position;
            }));
          }
        });
        
        return _.tpl('controls-insert', {
          childTypes: childTypes
        });
      }
    },
    move: {
      render: function () {
        return _.tpl('controls-move', {});
      }
    },
    moveTarget: {
      render: function () {
        var movedNode = this.root.movedNode
        ,   level = this.level + 1;
        
        var moveTargets = moveTargetPositions(movedNode, this.position);
        if (movedNode.type.key !== '/type/section') {
          moveTargets = [_.last(moveTargets)];
        } else {
          moveTargets = _.map(moveTargets, function (position) {
            position.level = level;
            level++;
            return position;
          });
        }
        
        return _.tpl('controls-movetarget', {
          moveTargets: moveTargets
        });
      }
    }
  }

});
