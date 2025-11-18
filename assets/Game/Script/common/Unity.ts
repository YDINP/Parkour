export default class Unity {
    static iconSOV(soa: number): any {
        return soa == 0 ? this.Icon_Share : this.Icon_Video
    }

    static Icon_Share = "Texture/ui/icon/share"
    static Icon_Video = "Texture/ui/icon/video"

}