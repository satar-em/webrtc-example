package database

import "github.com/gofiber/contrib/websocket"

type WebSocketMessage struct {
	Data   interface{} `json:"data"`
	Type   string      `json:"type"`
	Sender uint        `json:"sender"`
}
type WebSocketMessageChanelStruct struct {
	Message    *WebSocketMessage
	Connection *websocket.Conn
}

var WebSocketMessageChanel = make(chan WebSocketMessageChanelStruct)
