package server

import (
	"encoding/json"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"

	"time"
	"webrtc-server-go/database"
)

func init() {
	go channelMessageHandle()
}

func websocketUpgrade(c *fiber.Ctx) error {
	// IsWebSocketUpgrade returns true if the client
	// requested upgrade to the WebSocket protocol.
	if websocket.IsWebSocketUpgrade(c) {
		c.Locals("allowed", true)
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

var connectionPools = []*websocket.Conn{}

// var connectionPoolsMutex = new(sync.Mutex)
var websocketTimeOut = 1000 * time.Minute
var websocketHandle = websocket.New(func(c *websocket.Conn) {
	routApiMutex.Lock()
	// routApiMutexId++
	// log.WithFields(log.Fields{
	// 	"routApiMutexId": routApiMutexId,
	// }).Warn("Lock websocket.go 38")
	// c.Locals("connId", connectionPoolsId)
	connectionPools = append(connectionPools, c)
	routApiMutex.Unlock()
	// log.WithFields(log.Fields{
	// 	"routApiMutexId": routApiMutexId,
	// }).Warn("Unlock websocket.go 45")
	var (
		msgBytes []byte
		err      error
	)
	returnChannel := make(chan bool)
	ticker := time.NewTicker((websocketTimeOut * 9) / 10)
	defer func() {
		ticker.Stop()
		disconnectSoket(c)
		close(returnChannel)
		routApiMutex.Lock()
		// routApiMutexId++
		// log.WithFields(log.Fields{
		// 	"routApiMutexId": routApiMutexId,
		// }).Warn("Lock websocket.go 60")
		connectionPoolsTemp := []*websocket.Conn{}
		for _, conn := range connectionPools {
			if conn.Locals("connId") != c.Locals("connId") {
				connectionPoolsTemp = append(connectionPoolsTemp, conn)
			}
		}
		connectionPools = connectionPoolsTemp
		log.WithFields(log.Fields{
			"user":                 c.Locals("user"),
			"connId":               c.Locals("connId"),
			"len(connectionPools)": len(connectionPools),
		}).Println("connection close")
		routApiMutex.Unlock()
		// log.WithFields(log.Fields{
		// 	"routApiMutexId": routApiMutexId,
		// }).Warn("Unlock websocket.go 76")
	}()

	c.SetReadDeadline(time.Now().Add(websocketTimeOut))
	c.SetPongHandler(func(appData string) (err error) {
		c.SetReadDeadline(time.Now().Add(websocketTimeOut))
		return
	})

	go func() {
		for {
			msgPojo := &database.WebSocketMessage{}
			if _, msgBytes, err = c.ReadMessage(); err != nil {
				//soketLogrus.Println("ReadMessage error:", err)
				break
			}
			if err = json.Unmarshal(msgBytes, msgPojo); err != nil {
				log.WithFields(log.Fields{
					"user":   c.Locals("user"),
					"connId": c.Locals("connId"),
				}).Println("error Unmarshal ", err)
				continue
			}
			database.WebSocketMessageChanel <- database.WebSocketMessageChanelStruct{Message: msgPojo, Connection: c}
		}
		returnChannel <- true
	}()

	for {
		select {
		case <-returnChannel:
			return
		case tick := <-ticker.C:
			err := c.WriteMessage(websocket.PingMessage, []byte(tick.String()))
			if err != nil {
				return
			}
		}
	}

})

func disconnectSoket(c *websocket.Conn) {
	for _, emUser := range database.GetAllUsers() {
		if emUser.EqualSocketConnection(c) {
			database.WebSocketMessageChanel <- database.WebSocketMessageChanelStruct{
				Message: &database.WebSocketMessage{
					Type:   "user-disconnect",
					Sender: 0,
					Data: map[string]interface{}{
						"user": emUser,
					},
				},
			}
			break
		}
	}
}
