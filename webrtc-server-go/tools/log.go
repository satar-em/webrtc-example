package tools

import (
	"fmt"
	"path/filepath"
	"runtime"
	"strings"
)

func LogWithCurentLine() {

}

func Here(skip int) (string, string, int, error) {
	var pc uintptr
	var ok bool
	pc, fileName, fileLine, ok := runtime.Caller(skip)
	if !ok {
		return "", "", 0, fmt.Errorf("N/A")
	}
	fn := runtime.FuncForPC(pc)
	name := fn.Name()
	ix := strings.LastIndex(name, ".")
	if ix > 0 && (ix+1) < len(name) {
		name = name[ix+1:]
	}
	funcName := name
	nd, nf := filepath.Split(fileName)
	fileName = filepath.Join(filepath.Base(nd), nf)
	return funcName, fileName, fileLine, nil
}
