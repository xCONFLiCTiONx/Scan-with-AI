const StorageManager = {

    save(key, value) {

        return new Promise((resolve) => {

            chrome.storage.local.set(
                {
                    [key]: value
                },
                () => {

                    resolve(true);

                }
            );

        });

    },


    get(key) {

        return new Promise((resolve) => {

            chrome.storage.local.get(
                [key],
                result => {

                    resolve(
                        result[key]
                    );

                }
            );

        });

    },


    remove(key) {

        return new Promise((resolve) => {

            chrome.storage.local.remove(
                key,
                () => {

                    resolve(true);

                }
            );

        });

    }

};



if (typeof window !== "undefined") {

    window.StorageManager =
        StorageManager;

}