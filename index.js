const fse = require('fs-extra'),
    doctrine = require('doctrine');

const FILE= process.argv[2];
const MARKER_START = '/**';
const MARKER_START_SKIP = '/***';
const MARKER_END = '*/';

fse.readFile(FILE, 'UTF8')
    .then(source => {
        let blocks = extractDocBlocks(source);
        blocks = blocks.map(block => {
            let src = block.lines.join('\n');
            block.parsed = doctrine.parse(src, {unwrap: true});
            // delete block.lines;
            return block;
        });

        console.log(blocks);
    })
    .catch(console.error);

function extractDocBlocks(source){
    var block
    var blocks = []
    var extract = mkextract()
    var lines = source.split(/\n/)

    for (var i = 0, l = lines.length; i < l; i++) {
      block = extract(lines.shift())
      if (block) {
        blocks.push(block)
      }
    }

    return blocks;
}

// credit: https://github.com/yavorskiy/comment-parser
function mkextract (opts) {
    var chunk = null
    var indent = 0
    var number = 1

    /**
     * Read lines until they make a block
     * Return parsed block once fullfilled or null otherwise
     */
    return function extract (line) {
        var result = null
        var startPos = line.indexOf(MARKER_START)
        var endPos = line.indexOf(MARKER_END)

        // if open marker detected and it's not skip one
        if (startPos !== -1 && line.indexOf(MARKER_START_SKIP) !== startPos) {
            indent = startPos + MARKER_START.length
            chunk = {
                line: number,
                column: indent +1,
                lines: []
            };
        }

        // if we are on middle of comment block
        if (chunk) {
            var lineStart = indent

            // figure out if we slice from opening marker pos
            // or line start is shifted to the left
            // TODO check for tabs?
            var nonSpaceChar = line.match(/\S/)

            // skip for the first line starting with /** (fresh chunk)
            // it always has the right indentation
            if (chunk.length > 0 && nonSpaceChar) {
                if (nonSpaceChar[0] === '*') {
                    lineStart = nonSpaceChar.index + 2
                } else if (nonSpaceChar.index < indent) {
                    lineStart = nonSpaceChar.index
                }
            }

            // slice the line until end or until closing marker start
            chunk.lines.push(
                line.slice(lineStart -3, line.length)
            )

            // finalize block if end marker detected
            if (endPos !== -1) {
                result = chunk;
                chunk = null
                indent = 0
            }
        }

        number += 1
        return result
    }
}
