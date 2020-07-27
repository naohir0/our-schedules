'use strict';
import $ from 'jquery';

$('.availbutton').each((i,e)=>{
  const button = $(e);
  button.click(()=>{              
    const scheduleId = button.data('scheduleid');
    const userId = button.data('userid');
    const candidateId = button.data('candidateid');
    const avail = button.data('avail');
    const nextAvail = (avail + 1) % 3;
    console.log(scheduleId);
    console.log(userId);
    $.post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidateId}`,
    {avail:nextAvail,scheduleId:scheduleId},
    (data)=>{
      button.data('avail',data.avail);
      const availabilityLabels = ['欠', '？', '出'];
      button.text(availabilityLabels[data.avail]);
    })
  })
});

$('.comment-button').each((i,e)=>{
  const button = $(e);
  button.click(()=>{
    const scheduleId = button.data('schedule-id');
    const userId = button.data('user-id');
    const newcomment = window.prompt('コメントを入力してください');
   if(newcomment){
   $.post(`/schedules/${scheduleId}/users/${userId}/comment`,
   {newcomment:newcomment},
     (data)=>{
     $('.comment-text').text(data.comment);
    })
   }
  });
});