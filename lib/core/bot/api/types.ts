import {
  Sender,
  MessageNode
} from '../Message';

export interface httpApiReturn {
  statusCode: number,
  retcode: number,
  status: string,
  data: any
}

/** OneBot原版协议 **/

export interface GroupMember {
  age: number,
  area: string,
  card: string,
  card_changeable: false,
  group_id: number,
  join_time: number,
  last_sent_time: number,
  level: string,
  nickname: string,
  role: string,
  sex: string,
  title: string,
  title_expire_time: number,
  unfriendly: boolean,
  user_id: number
}

export interface HonorList {
  user_id: number,
  nickname: string,
  avatar: string,
  description: string
}

export interface httpApiReturn_sendMessage extends httpApiReturn {
  data: {
    message_id: number
  }
}

export interface httpApiReturn_getMessage extends httpApiReturn {
  data: {
    time: number,
    message_type: "private" | "group",
    message_id: number,
    real_id: number,
    message: string,
    sender: Sender,
  }
}

export interface httpApiReturn_getForwardMsg extends httpApiReturn {
  data: {
    message: MessageNode
  }
}

export interface httpApiReturn_loginInfo extends httpApiReturn {
  data: {
    user_id: number,
    nickname: string
  }
}

export interface httpApiReturn_friendList extends httpApiReturn {
  data: {
    nickname: string,
    remark: string,
    user_id: number
  }[]
}

export interface httpApiReturn_groupInfo extends httpApiReturn {
  data: {
    group_id: number,
    group_name: string,
    max_member_count: number,
    member_count: number
  }
}

export interface httpApiReturn_groupList extends httpApiReturn {
  data: {
    group_id: number,
    group_name: string,
    max_member_count: number,
    member_count: number
  }[]
}

export interface httpApiReturn_groupMemberInfo extends httpApiReturn {
  data: GroupMember
}

export interface httpApiReturn_groupMemberList extends httpApiReturn {
  data: GroupMember[]
}

export interface httpApiReturn_groupHonor extends httpApiReturn {
  data: {
    group_id: number,
    current_talkative?: {
      user_id: number,
      nickname: string,
      avatar: string,
      day_count: number
    },
    talkative_list?: HonorList,
    performer_list?: HonorList,
    legend_list?: HonorList,
    strong_newbie_list?: HonorList,
    emotion_list?: HonorList
  }
}

export interface httpApiReturn_getImage extends httpApiReturn {
  data: {
    file: string,
    filename: string,
    size: number,
    url: string
  }
}

/** GoCQHTTP协议 **/

export interface httpApiReturn_GoCQHTTP_messageNode {
  content: string,
  sender: Sender,
  time: number
}

export interface httpApiReturn_GoCQHTTP_getGroupMessage extends httpApiReturn {
  data: {
    content: string,
    message_id: number,
    real_id: number,
    sender: Sender
    time: number
  }
}

export interface httpApiReturn_GoCQHTTP_getForwardMsg extends httpApiReturn {
  data: {
    messages: httpApiReturn_GoCQHTTP_messageNode[]
  }
}