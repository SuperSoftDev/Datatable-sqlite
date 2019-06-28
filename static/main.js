$(document).ready(function() {
  init_tables();
  function init_tables() {
    for(var i=0;i<total_data.length;i++) {
      var table = $('#table_'+total_data[i][0]+' table').DataTable({
        "scrollCollapse": true,
        "scrollY": 200,
        "scrollX": true,
        "paging": true,
        select: {
          style: 'multi'
        }
      });
      table
        .on( 'select', function ( e, dt, type, indexes ) {
          var curtable = $('#table_'+total_data[$("#tablename").val()][0]+' table').DataTable();
          var row = curtable.rows( indexes ).data().toArray();
          child = "<li>Select Row (" + row.toString() + ") at "+total_data[$("#tablename").val()][0]+"</li>";
          $(".history-view ul").append(child);
        } )
        .on( 'deselect', function ( e, dt, type, indexes ) {
          var curtable = $('#table_'+total_data[$("#tablename").val()][0]+' table').DataTable();
          var row = curtable.rows( indexes ).data().toArray();
          child = "<li>Deselect Row (" + row.toString() + ") at "+total_data[$("#tablename").val()][0]+"</li>";
          $(".history-view ul").append(child);
        } );
    }
    show_currentTable();
  }

  function show_currentTable() {
    for(var i=0;i<total_data.length;i++) {
      $('#table_'+total_data[i][0]).hide();
      $('#inputDiv_'+total_data[i][0]).hide();
    }
    $('#table_'+total_data[$("#tablename").val()][0]).show();
    $('#inputDiv_'+total_data[$("#tablename").val()][0]).show();
  }
  var is_saveModal = false;

  // $('#example tbody').on( 'click', 'tr', function () {
  //   if ( $(this).hasClass('selected') ) {
  //       $(this).removeClass('selected');
  //   }
  //   else {
  //       table.$('tr.selected').removeClass('selected');
  //       $(this).addClass('selected');
  //   }
  // } );



  $('#btn_add').click( function () {
    $('#modal-btn-add').show();
    $('#modal-btn-save').hide();
    var table_info = total_data[$("#tablename").val()];
    $('#in_'+table_info[0]+"_"+table_info[1][0]).prop('disabled',false);
    for(i=0;i<table_info[1].length;i++) {
      $('#in_'+table_info[0]+"_"+table_info[1][i]).val("");  
    }
    is_saveModal = false;
    $("#modal-dialog").show();
  } );

  $('#btn_change').click( function () {
    $('#modal-btn-add').hide();
    $('#modal-btn-save').show();
    $('#modal-btn-save').prop('disabled',true);
    var table_info = total_data[$("#tablename").val()];
    var curtable = $('#table_'+table_info[0]+' table').DataTable();
    $('#in_'+table_info[0]+"_"+table_info[1][0]).prop('disabled',true);
    if(curtable.rows('.selected').data().length==0){
      alert("Please select!");
      return;
    }
    var ids = curtable.rows('.selected').data()[0];
    for(i=0;i<table_info[1].length;i++) {
      $('#in_'+table_info[0]+"_"+table_info[1][i]).val(ids[i]);
    }
    is_saveModal = true;
    $("#modal-dialog").show();
  } );

  $('#modal-btn-add').click(function(){
    if(!checkValidate()){
      alert("Please fill blanks!");
      return;
    }
    var table_info = total_data[$("#tablename").val()];
    var curtable = $('#table_'+table_info[0]+' table').DataTable();
    var row = new Array();
    for(i=0;i<table_info[1].length;i++) {
      row.push($('#in_'+table_info[0]+"_"+table_info[1][i]).val());
    }
    $.ajax({
      url: "/add",
      type: "POST",
      data: {
        param: JSON.stringify(row),
        tablename: JSON.stringify(table_info[0])
      },
      success: function(res) {
        if(res=="ok")
        {
          curtable.row.add(row).draw( false );
          $("#modal-dialog").hide();
          child = "<li>Add Row (" + row.toString() + ") at "+ table_info[0]+"</li>";
          $(".history-view ul").append(child);
        } else {
          alert("This can't be added!");
        }
        console.log(res);
      }
    });
  })

  $('#modal-btn-save').click(function(){
    if(!checkValidate()){
      alert("Please fill blanks!");
      return;
    }
    var table_info = total_data[$("#tablename").val()];
    var curtable = $('#table_'+table_info[0]+' table').DataTable();
    var row = new Array();
    for(i=0;i<table_info[1].length;i++) {
      row.push($('#in_'+table_info[0]+"_"+table_info[1][i]).val());
    }

    if(!confirm("Do you want to change this row?"))
      return;

    $.ajax({
      url: "/update",
      type: "POST",
      data: {
        param: JSON.stringify(row),
        tablename: JSON.stringify(table_info[0])
      },
      success: function(res) {
        if(res=="ok")
        {
          curtable.rows('.selected')[0]
            .every(function (rowIdx, tableLoop, rowLoop) {
              for(i=0;i<row.length;i++) {
                curtable.cell(rowIdx,i).data(row[i]); 
              }
          });
          $("#modal-dialog").hide();
          child = "<li>Change Row (" + curtable.rows('.selected').data()[0].toString() + ") at "+table_info[0]+"</li>";
          $(".history-view ul").append(child);
        } else {
          alert("This can't be updated!");
        }
        console.log(res);
      }
    });   
  })
  
  $('#btn_delete').click( function () {
    var table_info = total_data[$("#tablename").val()];
    var curtable = $('#table_'+table_info[0]+' table').DataTable();
    if(curtable.rows('.selected').data().length==0){
      alert("Please select!");
      return;
    }
    if(!confirm("Do you want to delete this row?"))
      return;
    $.ajax({
      url: "/delete",
      type: "POST",
      data: {
        param: curtable.rows('.selected').data()[0][0],
        tablename: table_info[0]
      },
      success: function(res) {
        if(res=="ok")
        {
          child = "<li>Delete Row (" + curtable.rows('.selected').data()[0].toString() +") at "+table_info[0] +"</li>";
          curtable.row('.selected').remove().draw( false );
          $("#modal-dialog").hide();
          $(".history-view ul").append(child);
        } else {
          alert("This can't be deleted!");
        }
        console.log(res);
      }
    });
  } );

  $('#modal-btn-cancel').click(function(){
    $("#modal-dialog").hide();
  })

  $('.modal-input').on('input',function() {
    if(!is_saveModal)
      return;
    is_diff = false;
    var table_info = total_data[$("#tablename").val()];
    var curtable = $('#table_'+table_info[0]+' table').DataTable();
    var ids = curtable.rows('.selected').data()[0];
    for(i=0;i<table_info[1].length;i++) {
      if($('#in_'+table_info[0]+"_"+table_info[1][i]).val() != ids[i])
        is_diff = true;
    }
    $('#modal-btn-save').prop('disabled',!is_diff);
  })

  $('#tablename').on('change',function(){
    show_currentTable();
  })

  function checkValidate(){
    var table_info = total_data[$("#tablename").val()];
    for(i=0;i<table_info[1].length;i++) {
      if($('#in_'+table_info[0]+"_"+table_info[1][i]).val()=="")
        return false;  
    }
    return true;
  }
} );