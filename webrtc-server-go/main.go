package main

import (
	"os"
	"webrtc-server-go/server"

	"github.com/sirupsen/logrus"
)

func init() {
	logrus.SetFormatter(&logrus.TextFormatter{
		ForceColors:   true,
		FullTimestamp: true,
	})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	logrus.SetOutput(os.Stdout)

	// Only log the warning severity or above.
	//logrus.SetLevel(logrus.WarnLevel)
}
func main() {

	server.InitWeb()
}
