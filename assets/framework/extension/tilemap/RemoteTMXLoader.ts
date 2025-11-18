export type TMXProgressListener = (completedCount: number, totalCount: number, item: any) => void
export default class RemoteTMXLoader {
    private _baseUrl: string = ""
    public get baseUrl(): string {
        return this._baseUrl;
    }
    public set baseUrl(value: string) {
        this._baseUrl = value;
    }

    cache_tmx = {}
    cache_images = {}

    loadRemote(url): Promise<cc.TiledMapAsset> {
        //load remote tmx 
        return new Promise(resolve => {
            url = this._baseUrl + url;
            let asset = this.cache_tmx[url]
            if (asset) {
                return resolve(asset)
            }
            cc.loader.load({ url: url, type: "tmx" }, (err, res) => {
                if (!res) return resolve(null);
                var tmxAsset = new cc.TiledMapAsset();
                tmxAsset['tmxXmlStr'] = res;
                let imageNames = this.getImages(res)
                this.cache_images[url] = imageNames;
                tmxAsset.textureNames = imageNames;
                let imageFulPaths = imageNames.map(v => this.baseUrl + v);
                cc.loader.load(imageFulPaths, (err, res: cc.LoadingItems) => {
                    tmxAsset.textures = Object.keys(res.map).map(k => res.map[k].content);
                    resolve(tmxAsset);
                    this.cache_tmx[url] = tmxAsset
                })
            })
        })
    }

    // tobe tested
    release(url, bReleaseTilesetTextures = false) {
        delete this.cache_tmx[url]
        //todo: delete textures 
        if (bReleaseTilesetTextures) {
            let images = this.cache_images[url]
            let imageFulPaths = images.map(v => this.baseUrl + v);
            imageFulPaths.forEach(v => cc.loader.release(v))
        }
        cc.loader.release(url)
    }

    isLoading = false;


    load(url, progressCallback: TMXProgressListener) {
        if (url.indexOf('http') == -1) {
            return tmxLoader.loadRes(url, progressCallback)
        }
        return tmxLoader.loadRemote(url)
    }

    loadRes(url, progressCallback: TMXProgressListener): Promise<cc.TiledMapAsset> {
        this.isLoading = true;
        return new Promise<cc.TiledMapAsset>((resolve, reject) => {
            cc.loader.loadRes(url, cc.TiledMapAsset, progressCallback, (err, res) => {
                this.isLoading = false;
                if (!err)
                    resolve(res)
                else {
                    reject(err);
                }
            })
        })
    }

    getImages(str): string[] {
        let images = []
        let a
        let reg = new RegExp(/\<image source=\"([^\"]+)\"/, "g")
        do {
            a = reg.exec(str)
            if (a) {
                if (a[1])
                    images.push(a[1])
            }
        } while (a)
        reg.lastIndex = 0;
        return images;
    }
}


export let tmxLoader: RemoteTMXLoader = new RemoteTMXLoader();