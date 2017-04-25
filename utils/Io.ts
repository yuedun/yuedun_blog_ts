import * as FS from 'fs';
import * as Path from 'path';

export function listFiles(path: string, regex = /./): string[] {
    var names = FS.readdirSync(path);
    var files: string[] = [];
    var dirs: string[] = [];

    for (var name of names) {
        var targetPath = Path.join(path, name);
        if (FS.statSync(targetPath).isFile()) {
            if (regex.test(targetPath)) {
                files.push(targetPath);
            }
        } else {
            dirs.push(targetPath);
        }
    }

    for (var dir of dirs) {
        files.push(...listFiles(dir, regex));
    }

    return files;
}
